const regexpColor = new RegExp(/^#[a-f0-9]{3,6}$/)
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
 * @param {Date}    creationDate=null Date of creation
 * @param {Boolean} emailAccepted=false Email accepted
 * @param {String}  displayName=''  Display name
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
    creationDate = null,
    emailAccepted = false,
    displayName = ''
    // bitmap = '' // bitmap as base64 string
  } = {}) {
    this.firstname = String(firstname)
    this.lastname = String(lastname)
    this.email = String(email)
    this.uid = String(uid)
    this.username = String(username)
    this.isActive = !!isActive
    this.isStaff = !!isStaff
    this.groups = groups
    this.picture = String(picture)

    this.setPattern(pattern)

    if (creationDate instanceof Date) {
      this.creationDate = creationDate
    } else if (creationDate) {
      this.creationDate = new Date(creationDate)
    }

    this.emailAccepted = Boolean(emailAccepted)

    if (displayName) {
      this.displayName = String(displayName)
    } else if (this.isStaff) {
      this.displayName = 'staff'
    } else {
      this.displayName = 'guest'
    }
  }

  setPattern(pattern) {
    if (!Array.isArray(pattern)) {
      this.pattern = String(pattern).split(/\s*,\s*/)
    } else {
      this.pattern = pattern
    }
    this.colors = []
    this.pattern = this.pattern.map(color => {
      if (regexpColor.test(color)) {
        this.colors.push(color)
        return color
      }
      return color
    })
  }
}
