(function () {
  function initEditorToolbar() {
    const editor = document.getElementById('result');
    const toolbar = document.querySelector('[data-editor-toolbar]');
    if (!editor || !toolbar) return;

    let savedRange = null;
    const rememberSelection = () => {
      const selection = window.getSelection();
      if (selection.rangeCount && editor.contains(selection.anchorNode)) savedRange = selection.getRangeAt(0).cloneRange();
    };
    const restoreSelection = () => {
      editor.focus();
      if (!savedRange) return;
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    };
    const run = (command, value) => {
      restoreSelection();
      document.execCommand(command, false, value || null);
      rememberSelection();
    };

    ['keyup', 'mouseup', 'input', 'focus'].forEach(type => editor.addEventListener(type, rememberSelection));
    editor.addEventListener('keydown', event => {
      if (event.key !== 'Enter' || event.isComposing) return;
      event.preventDefault();
      document.execCommand('insertLineBreak');
      rememberSelection();
    });
    toolbar.addEventListener('mousedown', event => {
      if (event.target.closest('button')) event.preventDefault();
    });
    toolbar.addEventListener('click', event => {
      const control = event.target.closest('[data-editor-command]');
      if (!control || control.tagName === 'SELECT') return;
      run(control.dataset.editorCommand, control.dataset.editorValue);
    });
    toolbar.addEventListener('change', event => {
      const control = event.target.closest('select[data-editor-command]');
      if (!control) return;
      run(control.dataset.editorCommand, control.value);
      control.selectedIndex = 0;
    });
  }

  window.initEditorToolbar = initEditorToolbar;
}());
