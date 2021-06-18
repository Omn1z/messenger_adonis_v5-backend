declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    memberExist(): Rule
    noDuplicates(): Rule
  }
}
