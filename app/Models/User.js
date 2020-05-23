'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
    static get table(){
        return 'Users'
    }
    static get createdAtColumn () {
        return null
    }
    static get updatedAtColumn () {
        return null
    }
    static get visible () {
        return ['id','lastName', 'firstName', 'username', 'password', 'type', 'phoneNumber', 'address', 'identity_card', 'token']
    }
}

module.exports = User
