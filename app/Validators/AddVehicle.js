'use strict'

class AddVehicle {
  get rules () {
    return {
      registrationNumber: 'required|alpha_numeric',
      brand: 'required|alpha',
      color: 'required|alpha',
    }
  }
  get messages () {
    return {
      'required': 'Merci de renseigner tous les champs',
      'brand.alpha': 'Marque invalide',
      'color.alpha': 'Couleur invalide',
      'alpha_numeric': 'Immatriculation invalide',
    }
    
  }
  async fails (errorMessages) {
    return this.ctx.response.json({done:false, message: errorMessages[0].message})
  }
}

module.exports = AddVehicle
