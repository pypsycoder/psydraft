(function () {
    function initEditorToolbar() {
        var editor = document.getElementById('result');
        var toolbar = document.querySelector('[data-editor-toolbar]');
        if (!editor || !toolbar) return;

        var savedRange = null;

        function rememberSelection() {
            var selection = window.getSelection();
            if (selection.rangeCount && editor.contains(selection.anchorNode)) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }
        }

        function restoreSelection() {
            editor.focus();
            if (!savedRange) return;
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }

        function run(command, value) {
            restoreSelection();
            document.execCommand(command, false, value || null);
            rememberSelection();
        }

        editor.addEventListener('keyup', rememberSelection);
        editor.addEventListener('mouseup', rememberSelection);
        editor.addEventListener('input', rememberSelection);
        editor.addEventListener('focus', rememberSelection);
        editor.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' || event.isComposing) return;
            event.preventDefault();
            document.execCommand('insertLineBreak');
            rememberSelection();
        });
        toolbar.addEventListener('mousedown', function (event) {
            if (event.target.closest('button')) event.preventDefault();
        });
        toolbar.addEventListener('click', function (event) {
            var control = event.target.closest('[data-editor-command]');
            if (!control || control.tagName === 'SELECT') return;
            run(control.dataset.editorCommand, control.dataset.editorValue);
        });
        toolbar.addEventListener('change', function (event) {
            var control = event.target.closest('select[data-editor-command]');
            if (!control) return;
            run(control.dataset.editorCommand, control.value);
            control.selectedIndex = 0;
        });
    }

    window.initEditorToolbar = initEditorToolbar;
}());
