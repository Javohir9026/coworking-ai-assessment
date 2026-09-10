import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'vue/html-self-closing': [
      'error',
      { html: { void: 'always', normal: 'any', component: 'any' }, svg: 'any', math: 'any' }
    ]
  }
})
