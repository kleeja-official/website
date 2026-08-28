// Arabic has six plural forms; vue-i18n's built-in rule only distinguishes
// three, so counts like "5 commits" would otherwise fall back to the dual.
export default defineI18nConfig(() => ({
  legacy: false,
  pluralRules: {
    ar: (choice: number) => {
      if (choice === 0) return 0
      if (choice === 1) return 1
      if (choice === 2) return 2
      const mod100 = choice % 100
      if (mod100 >= 3 && mod100 <= 10) return 3
      if (mod100 >= 11 && mod100 <= 99) return 4
      return 5
    },
  },
}))
