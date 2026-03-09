export type ValidationResult<T = void> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> }

export type RegisterInput = {
  email: string
  password: string
  name?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PASSWORD_RULES = [
  {
    test: (p: string) => p.length >= 8,
    field: 'password',
    msg: 'La contrasena debe tener al menos 8 caracteres',
  },
  {
    test: (p: string) => /[A-Z]/.test(p),
    field: 'password',
    msg: 'La contrasena debe incluir al menos una mayuscula',
  },
  {
    test: (p: string) => /[0-9]/.test(p),
    field: 'password',
    msg: 'La contrasena debe incluir al menos un numero',
  },
] as const

export function validateRegisterInput(input: RegisterInput): ValidationResult<RegisterInput> {
  const errors: Record<string, string> = {}
  const normalizedEmail = input.email.toLowerCase().trim()
  const trimmedName = input.name?.trim()

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    errors['email'] = 'El email no tiene un formato valido'
  }

  const failedRule = PASSWORD_RULES.find((rule) => !rule.test(input.password))
  if (failedRule) {
    errors[failedRule.field] = failedRule.msg
  }

  if (trimmedName !== undefined && trimmedName.length < 2) {
    errors['name'] = 'El nombre debe tener al menos 2 caracteres'
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      email: normalizedEmail,
      password: input.password,
      name: trimmedName,
    },
  }
}

export type ShippingAddress = {
  fullName: string
  street: string
  city: string
  province: string
  postalCode: string
  phone: string
}

export function validateShippingAddress(
  addr: ShippingAddress
): ValidationResult<ShippingAddress> {
  const errors: Record<string, string> = {}

  if (addr.fullName.trim().length < 3) {
    errors['fullName'] = 'El nombre debe tener al menos 3 caracteres'
  }

  if (addr.street.trim().length < 5) {
    errors['street'] = 'La direccion es demasiado corta'
  }

  if (addr.city.trim().length < 2) {
    errors['city'] = 'La ciudad es requerida'
  }

  if (addr.province.trim().length < 2) {
    errors['province'] = 'La provincia es requerida'
  }

  if (!/^\d{4}$/.test(addr.postalCode)) {
    errors['postalCode'] = 'El codigo postal debe tener 4 digitos'
  }

  if (!/^(\+54|0)[0-9\s\-]{8,14}$/.test(addr.phone)) {
    errors['phone'] = 'El telefono no es valido'
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: addr }
}
