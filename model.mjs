import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_ADDRESS);

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
