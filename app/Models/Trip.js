'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Trip extends Model {

    static get table(){
        return 'Trips'
    }
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    }
    static get visible () {
        return ['id','date', 'driver', 'vehicule', 'tripFeatures']
    }
    
}

module.exports = Trip
