    function collectIdeasText() {
        const items = [];
        document.querySelectorAll('.idea-checkbox').forEach(cb => {
            if (cb.checked) {
                const type = cb.dataset.ideaType;
                const descInput = document.querySelector('.idea-description[data-idea-type="' + type + '"]');
                const desc = descInput ? descInput.value.trim() : '';
                items.push(desc ? `${type} — ${desc}` : type);
            }
        });
        return items.join('; ');
    }

