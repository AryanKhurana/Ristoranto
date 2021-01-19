const {check, validationResult} = require('express-validator')

exports.validateProductRequest = [
    check('name').notEmpty().withMessage('Name is required'),
    check('price').notEmpty().withMessage('Price is required'),
    check('description').notEmpty().withMessage('Description is required')
]

exports.isProductRequestValidted = (req, res, next) => {
    const errors = validationResult(req)
    return res.status(400).json({
        error: errors.array()[0].msg
    })
    next()
} 