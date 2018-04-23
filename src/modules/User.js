/**
 * @class User is an object representing a loggedin user
 * @param {String} nameFirst First name of the user
 * @param {String} nameLast Last name of the user
 * @param {String} email email of the user used to login
 */
export default function User({
  nameFirst = '',
  nameLast = '',
  email = '',
} = {}) {
  this.nameFirst = nameFirst;
  this.nameLast = nameLast;
  this.email = email;
}
