'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Only the DOM operations used to construct a detached sheet and open its preview.
// No HTML parser, browser, network, or third-party dependency is needed.
function setup(options = {}) {
    const encode = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let document;
    class Node {
        constructor(tag) {
            this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
            this.attrs = {}; this.listeners = {}; this.dataset = {}; this._text = '';
            const classes = new Set();
            this.classList = {
                add: name => { classes.add(name); this.className = [...classes].join(' '); },
                remove: name => { classes.delete(name); this.className = [...classes].join(' '); },
                contains: name => classes.has(name)
            };
            if (options.noDialogAPI) this.showModal = undefined;
        }
        set textContent(value) { this._text = String(value); this.children = []; }
        get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
        appendChild(node) { if (node.parentNode) node.remove(); this.children.push(node); node.parentNode = this; return node; }
        insertBefore(node, next) { if (!next) return this.appendChild(node); if (node.parentNode) node.remove(); this.children.splice(this.children.indexOf(next), 0, node); node.parentNode = this; return node; }
        append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
        replaceChildren(...nodes) { this.children.forEach(child => { child.parentNode = null; }); this._text = ''; this.children = []; this.append(...nodes); }
        setAttribute(name, value) { this.attrs[name] = String(value); if (name === 'id') this.id = String(value); }
        getAttribute(name) { return Object.hasOwn(this.attrs, name) ? this.attrs[name] : null; }
        removeAttribute(name) { delete this.attrs[name]; }
        addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
        dispatch(name, event = {}) { (this.listeners[name] || []).slice().forEach(callback => callback({ target: this, preventDefault() {}, ...event })); }
        click() { if (this.tagName === 'A') document.downloads.push({ href: this.href, name: this.download }); this.dispatch('click'); }
        remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(node => node !== this); this.parentNode = null; }
        replaceWith(node) { const parent = this.parentNode; const index = parent.children.indexOf(this); parent.children[index] = node; node.parentNode = parent; this.parentNode = null; }
        contains(node) { return node === this || this.children.some(child => child.contains(node)); }
        querySelectorAll(selector) { return descendants(this).slice(1).filter(node => matches(node, selector)); }
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
        get isConnected() { return this === document.body || !!(this.parentNode && this.parentNode.isConnected); }
        focus() { document.activeElement = this; }
        showModal() { this.open = true; }
        close() { this.open = false; this.dispatch('close'); }
        cloneNode() {
            const copy = new Node(this.tagName); copy._text = this._text; copy.className = this.className; copy.id = this.id; copy.attrs = { ...this.attrs };
            this.children.forEach(child => copy.appendChild(child.cloneNode(true))); return copy;
        }
        get outerHTML() {
            if (this.tagName === '#TEXT') return encode(this._text);
            const attrs = { ...this.attrs, ...(this.className ? { class: this.className } : {}), ...(this.id ? { id: this.id } : {}) };
            return '<' + this.tagName.toLowerCase() + Object.entries(attrs).map(([key, value]) => ' ' + key + '="' + encode(value) + '"').join('') + '>' +
                (this.tagName === 'STYLE' ? this._text : encode(this._text)) + this.children.map(child => child.outerHTML).join('') + '</' + this.tagName.toLowerCase() + '>';
        }
    }
    function matches(node, selector) {
        if (selector.startsWith('#')) return node.id === selector.slice(1);
        if (selector.startsWith('.')) return (node.className || '').split(/\s+/).includes(selector.slice(1));
        const attr = selector.match(/^\[([^=]+)="([^"]+)"\]$/);
        if (attr) return attr[1].startsWith('data-') ? node.dataset[attr[1].slice(5)] === attr[2] : node.getAttribute(attr[1]) === attr[2];
        return node.tagName.toLowerCase() === selector;
    }
    function descendants(node) { return [node, ...node.children.flatMap(descendants)]; }
    const windowListeners = {};
    const blobs = [];
    document = {
        downloads: [], createElement: tag => new Node(tag),
        createTextNode: text => { const node = new Node('#text'); node.textContent = text; return node; },
        getElementById: id => descendants(document.body).find(node => node.id === id) || null,
        querySelectorAll: selector => descendants(document.body).filter(node => matches(node, selector)),
        addEventListener() {}, removeEventListener() {}
    };
    document.body = new Node('body');
    const trigger = new Node('button'); document.body.appendChild(trigger); trigger.focus();
    let prints = 0;
    const context = vm.createContext({
        console, document, Date, Math, Object, JSON, Number, String, Set, Map,
        Blob: class { constructor(parts, config) { this.text = parts.join(''); this.type = config.type; } },
        URL: { createObjectURL(blob) { blobs.push(blob); return 'blob:local-' + blobs.length; }, revokeObjectURL() {} },
        setTimeout: callback => { callback(); return 1; },
        addEventListener: (name, callback) => { (windowListeners[name] ||= []).push(callback); },
        removeEventListener: (name, callback) => { windowListeners[name] = (windowListeners[name] || []).filter(item => item !== callback); },
        location: { hash: '' }, focus() {}, print() {
            prints++;
            if (options.throwPrint) throw new Error('Printer unavailable');
            if (options.afterPrint) (windowListeners.afterprint || []).slice().forEach(callback => callback());
        }
    });
    context.window = context;
    ['registry', 'definitions', 'validation', 'scoring', 'interpretation', 'comparison', 'renderer'].forEach(name => {
        const filename = path.join(__dirname, '../../src/js/scales', name + '.js');
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename: name + '.js' });
    });
    return { S: context.PsyScales, document, trigger, descendants, blobs, prints: () => prints, windowListeners };
}

function completeAssessment(S, id, value) {
    const assessment = S.createAssessment(id, 'print-case');
    assessment.date = '2026-10-20';
    S.getDefinition(id).items.forEach(item => { assessment.answers[item.id] = value; });
    return assessment;
}

module.exports = { setup, completeAssessment };
