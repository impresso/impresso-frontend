/**
 * @class User is an object representing a loggedin user
 * @param {String}  firstname=''  First name of the user
 * @param {String}  lastname=''    Last name of the user
 * @param {String}  email=''       email of the user used to login
 * @param {String}  uid=''         ID of the user
 * @param {String}  username=''    username (taken from the email)
 * @param {Boolean} isActive=false is (still) enabled
 * @param {Boolean} isStaff=false  has access to the admin panel
 * @param {String}  groups=[]       Permission groups user is granted access
 * @param {String}  picture=''     Url of the picture
 * @param {Array}   pattern=[]     a list of hex colors, randomly picked at signup
 */
export default class User {
  constructor({
    firstname = '',
    lastname = '',
    email = '',
    uid = '',
    username = '',
    isActive = false,
    isStaff = false,
    groups = [],
    picture = '',
    pattern = [],
  } = {}) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.uid = uid;
    this.username = username;
    this.isActive = isActive;
    this.isStaff = isStaff;
    this.groups = groups;
    this.picture = picture;
    this.pattern = pattern;
  }
}
