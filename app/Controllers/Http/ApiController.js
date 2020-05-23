'use strict'
const axios = use('axios')
const Database = use('Database')
const moment = use('moment')

const Vehicle = use('App/Models/Vehicle')
const User = use('App/Models/User')
const TripFeature = use('App/Models/TripFeature')
const Trip = use('App/Models/Trip')


const Hash = use('Hash')

class ApiController {
  constructor() {
    this.password = null;
  }

  async login({request, response}) {
    if (request.input('username') && request.input('password')) {
      const user = await User.findBy('username', request.input('username'))
      if (user) {
        /*if (user.token != null) {
          return response.json({done: false, message: "Already login"})
        }*/
        const correctPassword = await Hash.verify(request.input('password'), user.password)
        if (correctPassword) {
          if (user.type == "administrator") {
            const token = this.generateToken()
            user.token = token
            user.save()
            return response.json({done: true, type: "administrator", token: token})
          } else {
            const token = this.generateToken()
            user.token = token
            user.save()
            return response.json({done: true, type: "driver", token: token, username: user.username, phone: user.phoneNumber})
          }
        } else
          return response.json({message: "identifiant ou mot de passe incorrecte", done: false})
      } else
        return response.json({message: "identifiant ou mot de passe incorrecte", done: false})
    } else
      return response.json({message: "Merci de renseigner tous les champs", done: false})
  }


  async changeLoginData({request, params, response}) {
    const user = await User.findBy('token', params.token)
    if (user) {
      if (user.type === "administrator") {
        if (request.input('username') && request.input('password')) {
          user.username = request.input('username')
          user.password = await Hash.make(request.input('password'))
          user.token = null
          user.save()
          return response.json({done: true})
        }
        return response.json({done: false, message: "Merci de renseigner tous les champs"})
      }else{
        if (request.input('username') && request.input('password') && request.input('phone')) {
            user.username = request.input('username')
            user.password = await Hash.make(request.input('password'))
            user.phoneNumber = request.input('phone')
            user.token = null
            user.save()
          return response.json({done: true})
        }
        return response.json({done: false, message: "Merci de renseigner tous les champs"})
      }
    }
    return response.json({done: false, message: "User not logged in"})
  }


  async logout({params, response}) {
    const user = await User.findBy('token', params.token)
    if (user) {
      user.token = null;
      user.save();
      return response.json({done: true})
    }
    return response.json({done: false, message: "User not logged in"})
  }


  generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
  }


  async addDriver({request, response, params}) {
    const user = await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      let newDriver = await User.create({
        firstName: request.input('firstName'),
        lastName: request.input('lastName'),
        address: request.input('address'),
        phoneNumber: request.input('phoneNumber'),
        type: "driver",
        username: this.generateDriverUsername(),
        password: await Hash.make(this.generateDriverPassword())
      })
      if (newDriver) {
        const httpRequest = await axios.post('https://textbelt.com/text', {
          phone: newDriver.phoneNumber,
          message: 'Salut '+request.input('firstName')+ ' '+ request.input('lastName')+
           '\nVoici vos coordonnées de connexion sur l\'application mobile' +
            '\nIdentifiant : ' + newDriver.username +
            '\nMot de passe : ' + this.password,
          key: 'textbelt',
        })
        if (httpRequest.data.success)
          return response.json({done: true})
        return response.json({done: false, message: httpRequest.data.error})
      }
      return response.json({done: false, message: "Erreur! Réessayer"})
    } else
      return response.json({done: false, message: "User not logged in or not authorized "})

  }

  async addVehicle({request, response, params}) {
    const user = await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      let newVehicule = await Vehicle.create({
        registrationNumber: request.input('registrationNumber'),
        brand: request.input('brand'),
        color: request.input('color'),
      })
      if (newVehicule) return response.json({done: true})
      return response.json({done: false, message: "Erreur! Réessayer"})
    } else
      return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async addTripFeatures({request, response, params}) {
    const user = await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      if (request.input('goingPlace') && request.input('goingHour') && request.input('arrivingPlace')) {
          let featureExiste = TripFeature.query()
          .where('goingPlace', request.input('goingPlace') )
          .where('arrivingPlace', request.input('arrivingPlace'))
          .first()
          if (featureExiste) return response.json({done: false, message: "Ligne de voyage déjà enrégistrer"})
          if (request.input('goingPlace') == request.input('arrivingPlace') ) return response.json({done: false, message: "Le lieu de départ ne peut être aussi le lieu d'arrivé"})
          let features = await TripFeature.create({
            goingPlace: request.input('goingPlace'),
            goingHour: request.input('goingHour'),
            arrivingPlace: request.input('arrivingPlace'),
          })
          if (features) return response.json({done: true})
          return response.json({done: false, message: "Erreur! Réessayer"})
      }
      return response.json({done: false, message: "Merci de rensigner tous les champs"})
    } 
    return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async getVehicles({response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type === "administrator") {
          return response.json({done: true, vehicles: await Vehicle.all()})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async getDrivers({response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type === "administrator") {
          const alldriver = await User.query().where('type', 'driver').fetch()
          return response.json({done: true, drivers: alldriver})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async getTripFeatures({response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type === "administrator") {
          const allTripFeatures = await TripFeature.all()
          return response.json({done: true, tripFeatures: allTripFeatures})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }


  generateDriverUsername() {
      return "DR"+ (new Date().getTime().toString(10).substr(9))
  }


  generateDriverPassword() {
      this.password = Math.random().toString(36).substr(5)
      return this.password
  }

  async modifyVehicle({request, response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type == "administrator") {
          let vehicle = await Vehicle.query().where('registrationNumber',params.id).update({
              registrationNumber : request.input('registrationNumber') ,
              brand: request.input('brand'),
              color: request.input('color')
          })
          if (vehicle) {
              return response.json({done: true})
          }
          return response.json({done: false, message: "Erreur! Réessayer"})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async deleteVehicle({response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type == "administrator") {
          let vehicule = await Vehicle.query().where('registrationNumber',params.id).delete()
          if (vehicule) {
              return response.json({done: true})
          }
          return response.json({done: false, message: "Erreur! Réessayer"})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async deleteDriver({response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type === "administrator") {
          let driver = await User.find(params.id)
          if (driver.type=="driver") {
              await driver.delete()
              return response.json({done: true})
          }
          return response.json({done: false, message: "Erreur! Réessayer"})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async modifyDriver({request, response, params}) {
      const user =  await User.findBy('token', params.token)
      if (user && user.type == "administrator") {
          let driver = await User.query().where('id',params.id).update({
              firstName : request.input('firstName'),
              lastName : request.input('lastName'),
              address: request.input('address'),
              phoneNumber : request.input('phoneNumber'),
          })
          if (driver) {
              return response.json({done: true})
          }
          return response.json({done: false, message: "Erreur! Réessayer"})
      }else
          return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async modifyTripFeatures({request, response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
        let features = await TripFeature.query().where('id',params.id).update({
          goingPlace: request.input('goingPlace'),
          goingHour: request.input('goingHour'),
          arrivingPlace: request.input('arrivingPlace'),
        })
        if (features) {
            return response.json({done: true})
        }
        return response.json({done: false, message: "Erreur! Réessayer"})
    }else
        return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async deleteTripFeatures({response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      let feature = await TripFeature.query().where('id',params.id).delete()
      if (feature) {
          return response.json({done: true})
      }
    }else
        return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async getTrips({response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
        const allTrips = await Database
        .select('Trips.id','lastName','firstName','registrationNumber','brand','goingPlace','arrivingPlace','goingHour')
        .select(Database.raw('DATE_FORMAT(date, "%Y-%m-%d") as date'))
        .from('Users')
        .innerJoin('Trips', 'Users.id', 'Trips.driver')
        .innerJoin('Vehicles', 'Vehicles.registrationNumber', 'Trips.vehicule')
        .innerJoin('TripFeatures', 'TripFeatures.id', 'Trips.tripFeatures')
        .where('date', '>=', moment().format('YYYY-MM-DD'))
        allTrips.forEach(element => {
           element.lastName = element.lastName+ " "+ element.firstName
           element.registrationNumber = element.registrationNumber+ " "+ element.brand
           element.goingPlace = element.goingPlace+ " "+ element.arrivingPlace+ " "+element.goingHour
         });
        return response.json({done: true, trips: allTrips})
    }else
        return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async pastTrips({response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
        const allTrips = await Database
        .select('Trips.id','lastName','firstName','registrationNumber','brand','goingPlace','arrivingPlace','goingHour')
        .select(Database.raw('DATE_FORMAT(date, "%Y-%m-%d") as date'))
        .from('Users')
        .innerJoin('Trips', 'Users.id', 'Trips.driver')
        .innerJoin('Vehicles', 'Vehicles.registrationNumber', 'Trips.vehicule')
        .innerJoin('TripFeatures', 'TripFeatures.id', 'Trips.tripFeatures')
        .where('date', '<', moment().format('YYYY-MM-DD'))
        allTrips.forEach(element => {
           element.lastName = element.lastName+ " "+ element.firstName
           element.registrationNumber = element.registrationNumber+ " "+ element.brand
           element.goingPlace = element.goingPlace+ " "+ element.arrivingPlace+ " "+element.goingHour
         });
        return response.json({done: true, trips: allTrips})
    }else
        return response.json({done: false, message: "User not logged in or not authorized "})
  }



  async addTrip({request, response, params}) {
    const user = await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      if (request.input('driver') && request.input('vehicule') && request.input('tripFeatures')) {
        let driver = await User.find(request.input('driver'))
        let tripFeatures = await TripFeature.find(request.input('tripFeatures'))
        if (driver && tripFeatures) {
            let trip = await Trip.create({
              date: request.input('date'),
              driver: request.input('driver'),
              vehicule: request.input('vehicule'),
              tripFeatures: request.input('tripFeatures'),
            })
            if (trip){
                const httpRequest = await axios.post('https://textbelt.com/text', {
                  phone: driver.phoneNumber,
                  message: 'Salut '+driver.firstName+ ' '+ driver.lastNam+
                  ' Vous êtes programmé pour un voyage le ' + request.input('date')+
                    ' sur ' + tripFeatures.goingPlace + ' - ' +tripFeatures.arrivingPlace+
                    ' à ' + tripFeatures.goingHour,
                  key: 'textbelt',
                })
                if (httpRequest.data.success) return response.json({done: true})
                return response.json({done: false, message: httpRequest.data.error})
            }
            return response.json({done: false, message: "Erreur! Réessayer"})
        }return response.json({done: false, message: "Erreur! Réessayer"})
      }
      return response.json({done: false, message: "Merci de rensigner tous les champs"})
    } 
    return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async deleteTrip({response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      let trip = await Trip.query().where('id',params.id).delete()
      if (trip) {
          return response.json({done: true})
      } 
      return response.json({done: false, message: "Error , réesayer!"})

    }else
        return response.json({done: false, message: "User not logged in or not authorized "})
  }

  async modifyTrip({request, response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user && user.type === "administrator") {
      if (request.input('driver') && request.input('vehicule') && request.input('tripFeatures')) {
        let trip = await Trip.query().where('id',params.id).update({
          date: request.input('date'),
          driver: request.input('driver'),
          vehicule: request.input('vehicule'),
          tripFeatures: request.input('tripFeatures'),
        })
        if (trip) return response.json({done: true})
        return response.json({done: false, message: "Erreur! Réessayer"})
      }
      return response.json({done: false, message: "Merci de rensigner tous les champs"})
    }
    return response.json({done: false, message: "User not logged in or not authorized "})
  }


  async getDriverTrips({response, params}) {
    const user =  await User.findBy('token', params.token)
    if (user) {
      const allTrips = await Database
        .select('Trips.id','lastName','firstName','registrationNumber','brand','goingPlace','arrivingPlace','goingHour')
        .select(Database.raw('DATE_FORMAT(date, "%Y-%m-%d") as date'))
        .from('Users')
        .innerJoin('Trips', 'Users.id', 'Trips.driver')
        .innerJoin('Vehicles', 'Vehicles.registrationNumber', 'Trips.vehicule')
        .innerJoin('TripFeatures', 'TripFeatures.id', 'Trips.tripFeatures')
        .where('date', '>=', moment().format('YYYY-MM-DD'))
        .where('username',  params.id)
        allTrips.forEach(element => {
           element.lastName = element.lastName+ " "+ element.firstName
           element.registrationNumber = element.registrationNumber+ " "+ element.brand
           element.goingPlace = element.goingPlace+ " "+ element.arrivingPlace+ " "+element.goingHour
         });
        return response.json({done: true, trips: allTrips})
    }else
        return response.json({done: false, message: "User not logged in or not authorized "})
  }


}

module.exports = ApiController