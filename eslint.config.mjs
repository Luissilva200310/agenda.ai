import security from 'eslint-plugin-security';
import noSecrets from 'eslint-plugin-no-secrets';

export default [
    {
        plugins: {
            security,
            'no-secrets': noSecrets,
        },
        rules: {
            ...security.configs.recommended.rules,
            'no-secrets/no-secrets': 'error',
        },
    },
];
