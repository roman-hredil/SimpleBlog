import {postModel} from './model.mjs';

export async function publishPost(data){
	const post = postModel(data);
	return await post.save();
}

export async function getPosts(){
	return await postModel.find({});
}

export async function getPost(id){
	return await postModel.findById(id);
}

export async function editPost(id, data){
	return await postModel.findByIdAndUpdate(id, data);
}

export async function deletePost(id){
	return await postModel.findByIdAndDelete(id);
}
