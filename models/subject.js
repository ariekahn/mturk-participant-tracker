var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SubjectSchema = new Schema({
    subjectId : String,
    status : Int16Array,
})