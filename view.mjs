import http from 'node:http';
import fs from 'node:fs/promises';
import qs from 'querystring';
import {publishPost, getPosts, getPost, editPost, deletePost} from './controller.mjs';

function escapeHTML(text){
	return text.toString()
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll(/\b51\b/g, 'ТАЛОН'); // easter egg
}

function fillPlaceholders(text, source){
	return text.replaceAll(/\{([^}]+)\}/g, (match, p1, offset, string, groups) => {
		return escapeHTML(source[p1]);
	})
}

function notFound(request, response){
	response.statusCode = 404;
	response.setHeader('Content-Type', 'text/plain');
	response.write('Not Found');
	response.end();
}

async function indexPage(request, response){
	let begin, entry, end, posts;
	try{
		begin = await fs.readFile('static/index_begin.html', {encoding: 'utf8'});
		entry = await fs.readFile('static/index_entry.html', {encoding: 'utf8'});
		end = await fs.readFile('static/index_end.html', {encoding: 'utf8'});
		posts = await getPosts();
	}catch(err){
		console.error(err);
		return notFound(request, response);
	}
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/html');
	response.write(begin);
	if(posts.length){
		posts.forEach((post) => {
			response.write(fillPlaceholders(entry, post));
		});
	}else{
		response.write('No posts<br>');
	}
	response.write(end);
	response.end();
}

async function postPage(request, postId, response){
	let data, post;
	try{
		data = await fs.readFile('static/post.html', {encoding: 'utf8'});
		post = await getPost(postId);
		data = fillPlaceholders(data, post);
	}catch(err){
		console.error(err);
		return notFound(request, response);
	}
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/html');
	response.write(data);
	response.end();
}

async function publishPage(request, body, response){
	if(request.method == 'POST'){
		try{
			await publishPost(qs.parse(body));
		}catch(err){
			console.error(err);
			return notFound(request, response);
		}
		response.statusCode = 302;
		response.setHeader('Location', '/');
		response.end();
	}else{
		let data;
		try{
			data = await fs.readFile('static/publish.html', {encoding: 'utf8'});
		}catch(err){
			console.error(err);
			return notFound(request, response);
		}
		response.statusCode = 200;
		response.setHeader('Content-Type', 'text/html');
		response.write(data);
		response.end();
	}
}

async function editPage(request, body, postId, response){
	if(request.method == 'POST'){
		try{
			await editPost(postId, qs.parse(body));
		}catch(err){
			console.error(err);
			return notFound(request, response);
		}
		response.statusCode = 302;
		response.setHeader('Location', '/');
		response.end();
	}else{
		let data, post;
		try{
			data = await fs.readFile('static/edit.html', {encoding: 'utf8'});
			post = await getPost(postId);
			data = fillPlaceholders(data, post);
		}catch(err){
			console.error(err);
			return notFound(request, response);
		}
		response.statusCode = 200;
		response.setHeader('Content-Type', 'text/html');
		response.write(data);
		response.end();
	}
}

async function deletePage(request, body, postId, response){
	if(request.method == 'POST'){
		try{
			if(qs.parse(body)['confirm'] == 'Yes.') await deletePost(postId);
		}catch(err){
			console.error(err);
			return notFound(request, response);
		}
		response.statusCode = 302;
		response.setHeader('Location', '/');
		response.end();
	}else{
		let data, post;
		try{
			data = await fs.readFile('static/delete.html', {encoding: 'utf8'});
			post = await getPost(postId);
			data = fillPlaceholders(data, post);
		}catch(err){
			console.error(err);
			return notFound(request, response);
		}
		response.statusCode = 200;
		response.setHeader('Content-Type', 'text/html');
		response.write(data);
		response.end();
	}
}

function dispatch(request, body, response){
	const url = request.url;
	if(url == '/') indexPage(request, response);
	else if(url == '/publish') publishPage(request, body, response);
	else if(url.startsWith('/post/')) postPage(request, url.slice(6), response);
	else if(url.startsWith('/edit/')) editPage(request, body, url.slice(6), response);
	else if(url.startsWith('/delete/')) deletePage(request, body, url.slice(8), response);
	else notFound(request, response);
}

export const server = http.createServer((request, response) => {
	const {headers, method, url} = request;
	let body = [];
	request.on('error', err => {
		console.error(err);
	}).on('data', chunk => {
		body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();

		response.on('error', err => {
			console.error(err);
		});

		dispatch(request, body, response);
	});
});
