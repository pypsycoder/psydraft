// One offline case owns the consultation, prescriptions, editor and scale assessments.
const FORM_SCHEMA = Object.freeze({
    schemaVersion: 1,
    storageKey: 'psydraft.case.v1',
    controls: 'input, select, textarea',
    editors: '[contenteditable="true"]'
});
