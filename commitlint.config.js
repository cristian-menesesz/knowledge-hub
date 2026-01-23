module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only changes
        'style', // Code style changes (formatting, missing semi-colons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or external dependencies
        'ci', // CI configuration files and scripts
        'chore', // Other changes that don't modify src or test files
        'revert', // Revert a previous commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'content-service',
        'auth-service',
        'comment-service',
        'media-service',
        'search-service',
        'analytics-service',
        'gateway',
        'shell',
        'content-reader',
        'content-editor',
        'admin-dashboard',
        'search-mfe',
        'discussion-mfe',
        'playground-mfe',
        'design-system',
        'deps',
        'config',
        'infra',
        'docs',
        'ci',
      ],
    ],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
