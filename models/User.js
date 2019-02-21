var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;
var bcrypt=require("bcrypt");

var UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: "First Name is Required",
        validate: [
            function (input) {
                return input.length >= 1;
            },
            "First Name should be longer."
        ]

    },
    lastName: {
        type: String,
        trim: true,
        required: "Last Name is Required",
        validate: [
            function (input) {
                return input.length >= 1;
            },
            "Last Name should be longer."
        ]
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, "Please enter a valid e-mail address"],
        index: {
            unique: true
        }
    },
    username: {
        type: String,
        required: true,
        validate: [
            function (input) {
                return input.length >= 1;
            },
            "Username should be longer."
        ],
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
        validate: [
            function (input) {
                return input.length >= 6;
            },
            "Password should be longer."
        ]
    },
    favorites: [
        {
          // Store ObjectIds in the array
          type: Schema.Types.ObjectId,
          // The ObjectIds will refer to the ids in the Article model
          ref: "Article"
        }
    ]
});

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// UserSchema.pre(save, function (next) {
//     var user = this;

//     // only hash the password if it has been modified (or is new)
//     if (!user.isModified('password')) return next();

//     // generate a salt
//     bcrypt.genSalt(10, function (err, salt) {
//         if (err) return next(err);

//         // hash the password using our new salt
//         bcrypt.hash(user.password, salt, function (err, hash) {
//             if (err) return next(err);

//             // override the cleartext password with the hashed one
//             user.password = hash;
//             next();
//         });
//     });
// });

// UserSchema.methods.comparePassword = function (candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
//         if (err) return cb(err);
//         cb(null, isMatch);
//     });
// };

// This creates our model from the above schema, using mongoose's model method
var User = mongoose.model("User", UserSchema);

// Export the User model
module.exports = User;