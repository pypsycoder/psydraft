    function collectIdeasText() {
        const items = [];
        document.querySelectorAll('.idea-checkbox').forEach(cb => {
            if (cb.checked) {
                const type = cb.dataset.ideaType;
                const descInput = document.querySelector('.idea-description[data-idea-type="' + type + '"]');
                const desc = descInput ? descInput.value.trim() : '';
                let entry = desc ? `${type} — ${desc}` : type;

                if (type === 'навязчивые') {
                    const compCb = document.getElementById('compulsions-checkbox');
                    if (compCb && compCb.checked) {
                        const compDesc = document.getElementById('compulsions-description');
                        const cd = compDesc ? compDesc.value.trim() : '';
                        entry += cd ? `; компульсии — ${cd}` : '; компульсии';
                    }
                }

                items.push(entry);
            }
        });
        return items.join('; ');
    }

    function initCompulsionsToggle() {
        const obsessiveCb = document.getElementById('idea-obsessive-cb');
        const subrow = document.getElementById('compulsions-subrow');
        if (!obsessiveCb || !subrow) return;
        obsessiveCb.addEventListener('change', function () {
            subrow.style.display = this.checked ? '' : 'none';
            if (!this.checked) {
                const compCb = document.getElementById('compulsions-checkbox');
                if (compCb) compCb.checked = false;
                const compDesc = document.getElementById('compulsions-description');
                if (compDesc) compDesc.value = '';
            }
        });
    }

