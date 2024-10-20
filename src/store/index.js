import {writable} from 'svelte/store';

const data = {};

export let booksPage = writable(data);