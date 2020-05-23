'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const User = use('App/Models/User')
const Hash = use('Hash')

Route.get('/', async () =>   {
  //await User.create({phoneNumber: '+22996346856',type: "administrator", username : 'Admin' , password: await  Hash.make("wezontracker")})
  return { greeting: 'Hello world in JSON' }
})

Route.group(() => {

  Route.post('login', 'ApiController.login')
  Route.post('changeLoginData/:token', 'ApiController.changeLoginData')

  Route.post('addDriver/:token', 'ApiController.addDriver').validator('AddDriver')
  Route.post('addVehicle/:token', 'ApiController.addVehicle').validator('AddVehicle')
  Route.post('addTripFeatures/:token', 'ApiController.addTripFeatures')
  Route.post('addTrip/:token', 'ApiController.addTrip')

  Route.post('modifyDriver/:token/:id', 'ApiController.modifyDriver').validator('AddDriver')
  Route.post('modifyVehicle/:token/:id', 'ApiController.modifyVehicle').validator('AddVehicle')
  Route.post('modifyTripFeatures/:token/:id', 'ApiController.modifyTripFeatures')
  Route.post('modifyTrip/:token/:id', 'ApiController.modifyTrip')


  Route.get('pastTrips/:token', 'ApiController.pastTrips')
  Route.get('getTrips/:token', 'ApiController.getTrips')
  Route.get('getDrivers/:token', 'ApiController.getDrivers')
  Route.get('getVehicles/:token', 'ApiController.getVehicles')
  Route.get('getTripFeatures/:token', 'ApiController.getTripFeatures')
  Route.get('deleteDriver/:token/:id', 'ApiController.deleteDriver')
  Route.get('deleteVehicle/:token/:id', 'ApiController.deleteVehicle')
  Route.get('deleteTripFeatures/:token/:id', 'ApiController.deleteTripFeatures')
  Route.get('deleteTrip/:token/:id', 'ApiController.deleteTrip')
  Route.get('getDriverTrips/:token/:id', 'ApiController.getDriverTrips')



  Route.get('logout/:token', 'ApiController.logout')

}).prefix('api/v1')