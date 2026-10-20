(function (S) {
    'use strict';
    Object.entries(S.fullDefinitions || {}).forEach(([id, definition]) => S.installFullDefinition({ ...definition, id }));
    if (S.basicSymptomCriteriaDefinition) S.installFullDefinition(S.basicSymptomCriteriaDefinition);
})(globalThis.PsyScales);
