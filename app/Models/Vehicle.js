'use strict'

const Model = use('Model')

class Vehicle extends Model {
    static get primaryKey () {
        return 'registrationNumber'
    }
    static get table(){
        return 'Vehicles'
    }
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    }
    static get visible () {
        return ['registrationNumber', 'brand', 'color']
    }
}

module.exports = Vehicle
