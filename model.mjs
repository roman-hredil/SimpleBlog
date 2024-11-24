import mongoose from 'mongoose';

mongoose.connect('mongodb://192.168.0.102:27017/test');

const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	}
});
export const postModel = mongoose.model('postModel', postSchema);
