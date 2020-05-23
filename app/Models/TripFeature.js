'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TripFeature extends Model {
    static get table(){
        return 'TripFeatures'
    }
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    }
    static get visible () {
        return ['id','goingPlace', 'arrivingPlace', 'goingHour']
    }
}

module.exports = TripFeature
