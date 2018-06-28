/**
 * @class User is an object representing a loggedin user
 * @param {String} nameFirst First name of the user
 * @param {String} nameLast Last name of the user
 * @param {String} email email of the user used to login
 * @param {String} uid ID of the user
 * @param {String} username Unique username
 * @param {Boolean} isStaff
 */
export default function User({
  nameFirst = '',
  nameLast = '',
  email = '',
  uid = '',
  username = '',
  isStaff = false,
  group = '',
} = {}) {
  this.nameFirst = nameFirst;
  this.nameLast = nameLast;
  this.email = email;
  this.uid = uid;
  this.username = username;
  this.isStaff = isStaff;
  this.group = group;
}
