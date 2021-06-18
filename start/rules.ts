import { validator, ValidationRuntimeOptions } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

validator.rule('memberExist', async (value: number, _, runtime: ValidationRuntimeOptions) => {
  const user = await User.findBy('id', value)
  if(user === null) {
    return runtime.errorReporter.report(
      runtime.pointer,
      'memberExist',
      '#ERR_MEMBERS_EXISTS',
      runtime.arrayExpressionPointer)
  }
}, () => {
  return {
    async: true,
  }
})

validator.rule('noDuplicates', (value: Array<any>, _, runtime: ValidationRuntimeOptions) => {
  const duplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)
  if(duplicates(value).length) {
    return runtime.errorReporter.report(
      runtime.pointer,
      'noDuplicates',
      '#ERR_NO_DUPLICATES',
      runtime.arrayExpressionPointer)
  }
})
