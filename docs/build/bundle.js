
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\LogoWrixy.svelte generated by Svelte v3.38.2 */

    const file$8 = "src\\components\\LogoWrixy.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let defs;
    	let style;
    	let t0;
    	let title;
    	let t1;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t0 = text(".cls-1 {\r\n            fill: #b67edb;\r\n        }\r\n\r\n        .cls-2 {\r\n            fill: #e0baec;\r\n        }\r\n\r\n        .cls-3 {\r\n            fill: #b67fdb;\r\n        }\r\n        ");
    			title = svg_element("title");
    			t1 = text("Sin título-1");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			add_location(style, file$8, 2, 8, 119);
    			add_location(defs, file$8, 1, 4, 103);
    			add_location(title, file$8, 15, 4, 328);
    			attr_dev(path0, "class", "cls-1");
    			attr_dev(path0, "d", "M13.77,51.52c.35-.16.69-.33,1-.47a7.69,7.69,0,0,0,4.93-6.12c1-6.21,2.27-12.39,3.55-18.55.86-4.14,1.76-8.28,2.63-12.42a7.31,7.31,0,0,1,1.89-3.57,6.64,6.64,0,0,1,4-1.81c4-.36,10.05.42,12.5.42H45c0,.16-.09.19-.16.21A7.21,7.21,0,0,0,40,15.13c-.66,3.76-1.6,7.46-2.37,11.2-.82,4-1.58,8-2.36,12.05-.47,2.36-.88,4.74-1.41,7.1a7.74,7.74,0,0,1-5.57,6.26,2.73,2.73,0,0,1-.76.07c-2,0-4,.07-6,0C19,51.65,16.39,51.71,13.77,51.52Z");
    			attr_dev(path0, "transform", "translate(-3.33 -8.49)");
    			add_location(path0, file$8, 16, 4, 361);
    			attr_dev(path1, "class", "cls-2");
    			attr_dev(path1, "d", "M3.41,45.05a13.29,13.29,0,0,1,.34-4.5c.9-4.57,1.82-9.13,2.73-13.7.27-1.35.57-2.69.8-4.05.08-.46.23-.54.62-.38a8,8,0,0,0,1.48.16c1.72-.09,5-.73,7.07-2.63,2.25-2.09,3.66-8.57,4.06-9.31.19-.36.54-.54.87-.08A7.74,7.74,0,0,1,22.86,16c-.28,2.64-1.06,5.16-1.59,7.74-.59,2.83-1.32,5.63-1.86,8.47C18.65,36.15,17.89,40.08,17,44a8.85,8.85,0,0,1-2.28,4,7.77,7.77,0,0,1-2.31,1.7,7.07,7.07,0,0,1-3.88.55,6.25,6.25,0,0,1-3.46-1.8A6.68,6.68,0,0,1,3.41,45.05Z");
    			attr_dev(path1, "transform", "translate(-3.33 -8.49)");
    			add_location(path1, file$8, 19, 4, 865);
    			attr_dev(path2, "class", "cls-3");
    			attr_dev(path2, "d", "M19.56,9.28l-.34.24a4.22,4.22,0,0,0-1.73,2.18A9.84,9.84,0,0,0,17,14a9.07,9.07,0,0,1-2.48,5.44,6.62,6.62,0,0,1-8.43.45,6.56,6.56,0,0,1-1.77-7.24A6.53,6.53,0,0,1,6.55,10a9.61,9.61,0,0,1,4.63-1.4C14,8.43,19.17,9,19.56,9.28Z");
    			attr_dev(path2, "transform", "translate(-3.33 -8.49)");
    			add_location(path2, file$8, 22, 4, 1396);
    			attr_dev(path3, "class", "cls-2");
    			attr_dev(path3, "d", "M55.92,15.62a13.25,13.25,0,0,1-.34,4.49c-.9,4.57-1.82,9.14-2.73,13.7-.27,1.35-.57,2.69-.8,4-.08.46-.22.54-.62.38a10.51,10.51,0,0,0-3.39,0,10.33,10.33,0,0,0-5.16,2.48c-2.25,2.08-3.66,8.56-4.06,9.31-.19.35-.54.54-.87.07a7.76,7.76,0,0,1-1.48-5.44c.28-2.63,1.06-5.16,1.59-7.74.59-2.83,1.33-5.63,1.87-8.46.75-3.94,1.51-7.88,2.38-11.8a8.9,8.9,0,0,1,2.28-4,7.62,7.62,0,0,1,2.31-1.69,7,7,0,0,1,3.88-.56,6.22,6.22,0,0,1,3.46,1.8A6.7,6.7,0,0,1,55.92,15.62Z");
    			attr_dev(path3, "transform", "translate(-3.33 -8.49)");
    			add_location(path3, file$8, 25, 4, 1705);
    			attr_dev(path4, "class", "cls-3");
    			attr_dev(path4, "d", "M39.78,51.38l.34-.24c1.63-1,2-2.68,2.21-4.45a9.08,9.08,0,0,1,2.47-5.44A6.24,6.24,0,0,1,55,48.05a6.57,6.57,0,0,1-2.22,2.63,9.5,9.5,0,0,1-4.63,1.4C45.38,52.24,40.16,51.7,39.78,51.38Z");
    			attr_dev(path4, "transform", "translate(-3.33 -8.49)");
    			add_location(path4, file$8, 28, 4, 2240);
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "data-name", "Capa 1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 52.67 43.62");
    			add_location(svg, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t0);
    			append_dev(svg, title);
    			append_dev(title, t1);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LogoWrixy", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LogoWrixy> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LogoWrixy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogoWrixy",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\components\HeaderG.svelte generated by Svelte v3.38.2 */

    const file$7 = "src\\components\\HeaderG.svelte";

    function create_fragment$7(ctx) {
    	let header;
    	let div5;
    	let div4;
    	let div0;
    	let i0;
    	let span0;
    	let t1;
    	let div3;
    	let div2;
    	let div1;
    	let i1;
    	let t2;
    	let input0;
    	let t3;
    	let div13;
    	let div6;
    	let img;
    	let img_src_value;
    	let t4;
    	let div7;
    	let i2;
    	let t5;
    	let div11;
    	let div10;
    	let div8;
    	let i3;
    	let t6;
    	let input1;
    	let t7;
    	let div9;
    	let i4;
    	let t8;
    	let div12;
    	let span1;
    	let i5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			span0 = element("span");
    			span0.textContent = "Iniciar sesión";
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			i1 = element("i");
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div13 = element("div");
    			div6 = element("div");
    			img = element("img");
    			t4 = space();
    			div7 = element("div");
    			i2 = element("i");
    			t5 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div8 = element("div");
    			i3 = element("i");
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div9 = element("div");
    			i4 = element("i");
    			t8 = space();
    			div12 = element("div");
    			span1 = element("span");
    			span1.textContent = "Iniciar sesión";
    			i5 = element("i");
    			attr_dev(i0, "class", "fas fa-user-circle");
    			add_location(i0, file$7, 163, 16, 4023);
    			attr_dev(span0, "class", "svelte-1jvd31i");
    			add_location(span0, file$7, 163, 50, 4057);
    			attr_dev(div0, "class", "header-profile small svelte-1jvd31i");
    			add_location(div0, file$7, 162, 12, 3971);
    			attr_dev(i1, "class", "fas fa-search");
    			add_location(i1, file$7, 168, 24, 4289);
    			attr_dev(div1, "class", "header-search__prefix svelte-1jvd31i");
    			add_location(div1, file$7, 167, 20, 4228);
    			attr_dev(input0, "class", "header-search__input svelte-1jvd31i");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Descubre una nueva aventura");
    			add_location(input0, file$7, 170, 20, 4368);
    			attr_dev(div2, "class", "header-search__elements svelte-1jvd31i");
    			add_location(div2, file$7, 166, 16, 4169);
    			attr_dev(div3, "class", "header-search small svelte-1jvd31i");
    			add_location(div3, file$7, 165, 12, 4118);
    			attr_dev(div4, "class", "main-nav__block svelte-1jvd31i");
    			add_location(div4, file$7, 161, 8, 3928);
    			attr_dev(div5, "class", "main-nav svelte-1jvd31i");
    			attr_dev(div5, "id", "main-nav");
    			add_location(div5, file$7, 160, 4, 3882);
    			attr_dev(img, "class", "header-logo__img svelte-1jvd31i");
    			if (img.src !== (img_src_value = "./img/wrixylogo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo Wrixy");
    			add_location(img, file$7, 177, 12, 4614);
    			attr_dev(div6, "class", "header-logo");
    			add_location(div6, file$7, 176, 8, 4575);
    			attr_dev(i2, "class", "fas fa-bars");
    			add_location(i2, file$7, 179, 80, 4785);
    			attr_dev(div7, "class", "main-menu-toggle svelte-1jvd31i");
    			attr_dev(div7, "id", "main-menu-toggle");
    			add_location(div7, file$7, 179, 8, 4713);
    			attr_dev(i3, "class", "fas fa-search");
    			add_location(i3, file$7, 183, 20, 4988);
    			attr_dev(div8, "class", "header-search__prefix svelte-1jvd31i");
    			add_location(div8, file$7, 182, 16, 4931);
    			attr_dev(input1, "class", "header-search__input svelte-1jvd31i");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Descubre una nueva aventura");
    			add_location(input1, file$7, 185, 16, 5059);
    			attr_dev(i4, "class", "fas fa-filter");
    			add_location(i4, file$7, 187, 20, 5224);
    			attr_dev(div9, "class", "header-search__suffix svelte-1jvd31i");
    			add_location(div9, file$7, 186, 16, 5167);
    			attr_dev(div10, "class", "header-search__elements svelte-1jvd31i");
    			add_location(div10, file$7, 181, 12, 4876);
    			attr_dev(div11, "class", "header-search length svelte-1jvd31i");
    			add_location(div11, file$7, 180, 8, 4828);
    			set_style(span1, "font-family", "'Mukta', sans-serif");
    			attr_dev(span1, "class", "svelte-1jvd31i");
    			add_location(span1, file$7, 192, 12, 5372);
    			attr_dev(i5, "class", "fas fa-user-circle");
    			add_location(i5, file$7, 192, 80, 5440);
    			attr_dev(div12, "class", "header-profile length svelte-1jvd31i");
    			add_location(div12, file$7, 191, 8, 5323);
    			attr_dev(div13, "class", "header-elements svelte-1jvd31i");
    			add_location(div13, file$7, 175, 4, 4536);
    			attr_dev(header, "id", "header-nav");
    			attr_dev(header, "class", "svelte-1jvd31i");
    			add_location(header, file$7, 159, 0, 3852);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, i0);
    			append_dev(div0, span0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, i1);
    			append_dev(div2, t2);
    			append_dev(div2, input0);
    			append_dev(header, t3);
    			append_dev(header, div13);
    			append_dev(div13, div6);
    			append_dev(div6, img);
    			append_dev(div13, t4);
    			append_dev(div13, div7);
    			append_dev(div7, i2);
    			append_dev(div13, t5);
    			append_dev(div13, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, i3);
    			append_dev(div10, t6);
    			append_dev(div10, input1);
    			append_dev(div10, t7);
    			append_dev(div10, div9);
    			append_dev(div9, i4);
    			append_dev(div13, t8);
    			append_dev(div13, div12);
    			append_dev(div12, span1);
    			append_dev(div12, i5);

    			if (!mounted) {
    				dispose = listen_dev(div7, "click", /*showMenu*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HeaderG", slots, []);

    	const showMenu = () => {
    		const nav = document.getElementById("main-nav");
    		const header = document.getElementById("header-nav");

    		if (nav.style.right === "0vw") {
    			nav.style.right = "-80vw";
    			header.style.borderRadius = "0 0 2rem 2rem";
    		} else {
    			nav.style.right = "0vw";
    			header.style.borderRadius = "0 0 0rem 2rem";
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HeaderG> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ showMenu });
    	return [showMenu];
    }

    class HeaderG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HeaderG",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const data = {};

    let booksPage = writable(data);

    /* src\components\ButtonGeneral.svelte generated by Svelte v3.38.2 */

    const file$6 = "src\\components\\ButtonGeneral.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let span;
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(/*content*/ ctx[0]);
    			attr_dev(span, "class", "buttonG__text svelte-z1qtj1");
    			add_location(span, file$6, 58, 4, 1239);
    			attr_dev(div, "class", div_class_value = "buttonG " + /*classb*/ ctx[1] + " svelte-z1qtj1");
    			add_location(div, file$6, 57, 0, 1203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) set_data_dev(t, /*content*/ ctx[0]);

    			if (dirty & /*classb*/ 2 && div_class_value !== (div_class_value = "buttonG " + /*classb*/ ctx[1] + " svelte-z1qtj1")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonGeneral", slots, []);
    	let { content = "" } = $$props;
    	let { classb = "" } = $$props;
    	const writable_props = ["content", "classb"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonGeneral> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("classb" in $$props) $$invalidate(1, classb = $$props.classb);
    	};

    	$$self.$capture_state = () => ({ content, classb });

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("classb" in $$props) $$invalidate(1, classb = $$props.classb);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, classb];
    }

    class ButtonGeneral extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { content: 0, classb: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonGeneral",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get content() {
    		throw new Error("<ButtonGeneral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<ButtonGeneral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classb() {
    		throw new Error("<ButtonGeneral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classb(value) {
    		throw new Error("<ButtonGeneral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.38.2 */

    const file$5 = "src\\components\\Card.svelte";

    // (261:0) {:else }
    function create_else_block$2(ctx) {
    	let div17;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let p0;
    	let t1_value = /*book*/ ctx[0].Title + "";
    	let t1;
    	let t2;
    	let p1;
    	let t4;
    	let div11;
    	let div3;
    	let div2;
    	let span0;
    	let t5_value = /*book*/ ctx[0].Title + "";
    	let t5;
    	let t6;
    	let div5;
    	let div4;
    	let span1;
    	let t7_value = /*descriptionDesign*/ ctx[2](/*book*/ ctx[0].Descriptions) + "";
    	let t7;
    	let t8;
    	let div10;
    	let div9;
    	let div6;
    	let i0;
    	let span2;
    	let t9_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "";
    	let t9;
    	let t10;
    	let div7;
    	let i1;
    	let span3;
    	let t11_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "";
    	let t11;
    	let t12;
    	let div8;
    	let i2;
    	let span4;
    	let t13_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "";
    	let t13;
    	let t14;
    	let div16;
    	let div15;
    	let div12;
    	let i3;
    	let span5;
    	let t15_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "";
    	let t15;
    	let t16;
    	let div13;
    	let i4;
    	let span6;
    	let t17_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "";
    	let t17;
    	let t18;
    	let div14;
    	let i5;
    	let span7;
    	let t19_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "";
    	let t19;

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "By: Anonimo";
    			t4 = space();
    			div11 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			span0 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			span1 = element("span");
    			t7 = text(t7_value);
    			t8 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div6 = element("div");
    			i0 = element("i");
    			span2 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			div7 = element("div");
    			i1 = element("i");
    			span3 = element("span");
    			t11 = text(t11_value);
    			t12 = space();
    			div8 = element("div");
    			i2 = element("i");
    			span4 = element("span");
    			t13 = text(t13_value);
    			t14 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div12 = element("div");
    			i3 = element("i");
    			span5 = element("span");
    			t15 = text(t15_value);
    			t16 = space();
    			div13 = element("div");
    			i4 = element("i");
    			span6 = element("span");
    			t17 = text(t17_value);
    			t18 = space();
    			div14 = element("div");
    			i5 = element("i");
    			span7 = element("span");
    			t19 = text(t19_value);
    			attr_dev(img, "class", "Poster__Img svelte-fkqnec");
    			if (img.src !== (img_src_value = "./img/LogoPoster.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "WrixyLogo");
    			add_location(img, file$5, 264, 16, 6961);
    			attr_dev(p0, "class", "Poster__Title svelte-fkqnec");
    			add_location(p0, file$5, 265, 16, 7047);
    			attr_dev(p1, "class", "Poster__Autor svelte-fkqnec");
    			add_location(p1, file$5, 266, 16, 7106);
    			attr_dev(div0, "class", "Poster__Content svelte-fkqnec");
    			add_location(div0, file$5, 263, 12, 6914);
    			attr_dev(div1, "class", "Poster svelte-fkqnec");
    			add_location(div1, file$5, 262, 8, 6880);
    			attr_dev(span0, "class", "CardHeader__Title svelte-fkqnec");
    			add_location(span0, file$5, 272, 20, 7323);
    			attr_dev(div2, "class", "ContentTitle svelte-fkqnec");
    			add_location(div2, file$5, 271, 16, 7275);
    			attr_dev(div3, "class", "CardHeader svelte-fkqnec");
    			add_location(div3, file$5, 270, 12, 7233);
    			attr_dev(span1, "class", "CardBody__Description");
    			add_location(span1, file$5, 277, 20, 7526);
    			attr_dev(div4, "class", "ContentDescription svelte-fkqnec");
    			add_location(div4, file$5, 276, 16, 7472);
    			attr_dev(div5, "class", "CardBody svelte-fkqnec");
    			add_location(div5, file$5, 275, 12, 7432);
    			attr_dev(i0, "class", "fas fa-eye");
    			add_location(i0, file$5, 282, 49, 7784);
    			attr_dev(span2, "class", "IconCount svelte-fkqnec");
    			add_location(span2, file$5, 282, 75, 7810);
    			attr_dev(div6, "class", "CardFooterIcons");
    			add_location(div6, file$5, 282, 20, 7755);
    			attr_dev(i1, "class", "fas fa-comments");
    			add_location(i1, file$5, 284, 49, 7955);
    			attr_dev(span3, "class", "IconCount svelte-fkqnec");
    			add_location(span3, file$5, 284, 80, 7986);
    			attr_dev(div7, "class", "CardFooterIcons");
    			add_location(div7, file$5, 284, 20, 7926);
    			attr_dev(i2, "class", "fas fa-heart");
    			add_location(i2, file$5, 286, 49, 8134);
    			attr_dev(span4, "class", "IconCount svelte-fkqnec");
    			add_location(span4, file$5, 286, 77, 8162);
    			attr_dev(div8, "class", "CardFooterIcons");
    			add_location(div8, file$5, 286, 20, 8105);
    			attr_dev(div9, "class", "ContentIcons svelte-fkqnec");
    			add_location(div9, file$5, 281, 16, 7707);
    			attr_dev(div10, "class", "CardFooter svelte-fkqnec");
    			add_location(div10, file$5, 280, 12, 7665);
    			attr_dev(div11, "class", "Card__Content svelte-fkqnec");
    			add_location(div11, file$5, 269, 8, 7192);
    			attr_dev(i3, "class", "fas fa-eye");
    			add_location(i3, file$5, 293, 45, 8443);
    			attr_dev(span5, "class", "IconCount svelte-fkqnec");
    			add_location(span5, file$5, 293, 71, 8469);
    			attr_dev(div12, "class", "CardFooterIcons");
    			add_location(div12, file$5, 293, 16, 8414);
    			attr_dev(i4, "class", "fas fa-comments");
    			add_location(i4, file$5, 295, 45, 8606);
    			attr_dev(span6, "class", "IconCount svelte-fkqnec");
    			add_location(span6, file$5, 295, 76, 8637);
    			attr_dev(div13, "class", "CardFooterIcons");
    			add_location(div13, file$5, 295, 16, 8577);
    			attr_dev(i5, "class", "fas fa-heart");
    			add_location(i5, file$5, 297, 45, 8777);
    			attr_dev(span7, "class", "IconCount svelte-fkqnec");
    			add_location(span7, file$5, 297, 73, 8805);
    			attr_dev(div14, "class", "CardFooterIcons");
    			add_location(div14, file$5, 297, 16, 8748);
    			attr_dev(div15, "class", "ContentIcons svelte-fkqnec");
    			add_location(div15, file$5, 292, 12, 8370);
    			attr_dev(div16, "class", "CardFooterActive svelte-fkqnec");
    			add_location(div16, file$5, 291, 8, 8326);
    			attr_dev(div17, "class", "Card NotPoster svelte-fkqnec");
    			add_location(div17, file$5, 261, 4, 6842);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(div17, t4);
    			append_dev(div17, div11);
    			append_dev(div11, div3);
    			append_dev(div3, div2);
    			append_dev(div2, span0);
    			append_dev(span0, t5);
    			append_dev(div11, t6);
    			append_dev(div11, div5);
    			append_dev(div5, div4);
    			append_dev(div4, span1);
    			append_dev(span1, t7);
    			append_dev(div11, t8);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div6);
    			append_dev(div6, i0);
    			append_dev(div6, span2);
    			append_dev(span2, t9);
    			append_dev(div9, t10);
    			append_dev(div9, div7);
    			append_dev(div7, i1);
    			append_dev(div7, span3);
    			append_dev(span3, t11);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div8, i2);
    			append_dev(div8, span4);
    			append_dev(span4, t13);
    			append_dev(div17, t14);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div12);
    			append_dev(div12, i3);
    			append_dev(div12, span5);
    			append_dev(span5, t15);
    			append_dev(div15, t16);
    			append_dev(div15, div13);
    			append_dev(div13, i4);
    			append_dev(div13, span6);
    			append_dev(span6, t17);
    			append_dev(div15, t18);
    			append_dev(div15, div14);
    			append_dev(div14, i5);
    			append_dev(div14, span7);
    			append_dev(span7, t19);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*book*/ 1 && t1_value !== (t1_value = /*book*/ ctx[0].Title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*book*/ 1 && t5_value !== (t5_value = /*book*/ ctx[0].Title + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*book*/ 1 && t7_value !== (t7_value = /*descriptionDesign*/ ctx[2](/*book*/ ctx[0].Descriptions) + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*book*/ 1 && t9_value !== (t9_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*book*/ 1 && t11_value !== (t11_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*book*/ 1 && t13_value !== (t13_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*book*/ 1 && t15_value !== (t15_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*book*/ 1 && t17_value !== (t17_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "")) set_data_dev(t17, t17_value);
    			if (dirty & /*book*/ 1 && t19_value !== (t19_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "")) set_data_dev(t19, t19_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(261:0) {:else }",
    		ctx
    	});

    	return block;
    }

    // (226:0) {#if book.UrlImg != ''}
    function create_if_block$2(ctx) {
    	let div15;
    	let div9;
    	let div1;
    	let div0;
    	let span0;
    	let t0_value = /*book*/ ctx[0].Title + "";
    	let t0;
    	let t1;
    	let div3;
    	let div2;
    	let span1;
    	let t2_value = /*descriptionDesign*/ ctx[2](/*book*/ ctx[0].Descriptions) + "";
    	let t2;
    	let t3;
    	let div8;
    	let div7;
    	let div4;
    	let i0;
    	let span2;
    	let t4_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "";
    	let t4;
    	let t5;
    	let div5;
    	let i1;
    	let span3;
    	let t6_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "";
    	let t6;
    	let t7;
    	let div6;
    	let i2;
    	let span4;
    	let t8_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "";
    	let t8;
    	let t9;
    	let div14;
    	let div13;
    	let div10;
    	let i3;
    	let span5;
    	let t10_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "";
    	let t10;
    	let t11;
    	let div11;
    	let i4;
    	let span6;
    	let t12_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "";
    	let t12;
    	let t13;
    	let div12;
    	let i5;
    	let span7;
    	let t14_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "";
    	let t14;

    	const block = {
    		c: function create() {
    			div15 = element("div");
    			div9 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div4 = element("div");
    			i0 = element("i");
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			div5 = element("div");
    			i1 = element("i");
    			span3 = element("span");
    			t6 = text(t6_value);
    			t7 = space();
    			div6 = element("div");
    			i2 = element("i");
    			span4 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div10 = element("div");
    			i3 = element("i");
    			span5 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			div11 = element("div");
    			i4 = element("i");
    			span6 = element("span");
    			t12 = text(t12_value);
    			t13 = space();
    			div12 = element("div");
    			i5 = element("i");
    			span7 = element("span");
    			t14 = text(t14_value);
    			attr_dev(span0, "class", "CardHeader__Title svelte-fkqnec");
    			add_location(span0, file$5, 230, 20, 5206);
    			attr_dev(div0, "class", "ContentTitle svelte-fkqnec");
    			add_location(div0, file$5, 229, 16, 5158);
    			attr_dev(div1, "class", "CardHeader svelte-fkqnec");
    			add_location(div1, file$5, 228, 12, 5116);
    			attr_dev(span1, "class", "CardBody__Description");
    			add_location(span1, file$5, 235, 20, 5409);
    			attr_dev(div2, "class", "ContentDescription svelte-fkqnec");
    			add_location(div2, file$5, 234, 16, 5355);
    			attr_dev(div3, "class", "CardBody svelte-fkqnec");
    			add_location(div3, file$5, 233, 12, 5315);
    			attr_dev(i0, "class", "fas fa-eye");
    			add_location(i0, file$5, 240, 49, 5667);
    			attr_dev(span2, "class", "IconCount svelte-fkqnec");
    			add_location(span2, file$5, 240, 75, 5693);
    			attr_dev(div4, "class", "CardFooterIcons");
    			add_location(div4, file$5, 240, 20, 5638);
    			attr_dev(i1, "class", "fas fa-comments");
    			add_location(i1, file$5, 242, 49, 5838);
    			attr_dev(span3, "class", "IconCount svelte-fkqnec");
    			add_location(span3, file$5, 242, 80, 5869);
    			attr_dev(div5, "class", "CardFooterIcons");
    			add_location(div5, file$5, 242, 20, 5809);
    			attr_dev(i2, "class", "fas fa-heart");
    			add_location(i2, file$5, 244, 49, 6017);
    			attr_dev(span4, "class", "IconCount svelte-fkqnec");
    			add_location(span4, file$5, 244, 77, 6045);
    			attr_dev(div6, "class", "CardFooterIcons");
    			add_location(div6, file$5, 244, 20, 5988);
    			attr_dev(div7, "class", "ContentIcons svelte-fkqnec");
    			add_location(div7, file$5, 239, 16, 5590);
    			attr_dev(div8, "class", "CardFooter svelte-fkqnec");
    			add_location(div8, file$5, 238, 12, 5548);
    			attr_dev(div9, "class", "Card__Content svelte-fkqnec");
    			add_location(div9, file$5, 227, 8, 5075);
    			attr_dev(i3, "class", "fas fa-eye");
    			add_location(i3, file$5, 251, 45, 6326);
    			attr_dev(span5, "class", "IconCount svelte-fkqnec");
    			add_location(span5, file$5, 251, 71, 6352);
    			attr_dev(div10, "class", "CardFooterIcons");
    			add_location(div10, file$5, 251, 16, 6297);
    			attr_dev(i4, "class", "fas fa-comments");
    			add_location(i4, file$5, 253, 45, 6489);
    			attr_dev(span6, "class", "IconCount svelte-fkqnec");
    			add_location(span6, file$5, 253, 76, 6520);
    			attr_dev(div11, "class", "CardFooterIcons");
    			add_location(div11, file$5, 253, 16, 6460);
    			attr_dev(i5, "class", "fas fa-heart");
    			add_location(i5, file$5, 255, 45, 6660);
    			attr_dev(span7, "class", "IconCount svelte-fkqnec");
    			add_location(span7, file$5, 255, 73, 6688);
    			attr_dev(div12, "class", "CardFooterIcons");
    			add_location(div12, file$5, 255, 16, 6631);
    			attr_dev(div13, "class", "ContentIcons svelte-fkqnec");
    			add_location(div13, file$5, 250, 12, 6253);
    			attr_dev(div14, "class", "CardFooterActive svelte-fkqnec");
    			add_location(div14, file$5, 249, 8, 6209);
    			attr_dev(div15, "class", "Card svelte-fkqnec");
    			set_style(div15, "background", "url(\"" + /*book*/ ctx[0].UrlImg + "\")");
    			add_location(div15, file$5, 226, 4, 5005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div9);
    			append_dev(div9, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div9, t1);
    			append_dev(div9, div3);
    			append_dev(div3, div2);
    			append_dev(div2, span1);
    			append_dev(span1, t2);
    			append_dev(div9, t3);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, i0);
    			append_dev(div4, span2);
    			append_dev(span2, t4);
    			append_dev(div7, t5);
    			append_dev(div7, div5);
    			append_dev(div5, i1);
    			append_dev(div5, span3);
    			append_dev(span3, t6);
    			append_dev(div7, t7);
    			append_dev(div7, div6);
    			append_dev(div6, i2);
    			append_dev(div6, span4);
    			append_dev(span4, t8);
    			append_dev(div15, t9);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div10);
    			append_dev(div10, i3);
    			append_dev(div10, span5);
    			append_dev(span5, t10);
    			append_dev(div13, t11);
    			append_dev(div13, div11);
    			append_dev(div11, i4);
    			append_dev(div11, span6);
    			append_dev(span6, t12);
    			append_dev(div13, t13);
    			append_dev(div13, div12);
    			append_dev(div12, i5);
    			append_dev(div12, span7);
    			append_dev(span7, t14);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*book*/ 1 && t0_value !== (t0_value = /*book*/ ctx[0].Title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*book*/ 1 && t2_value !== (t2_value = /*descriptionDesign*/ ctx[2](/*book*/ ctx[0].Descriptions) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*book*/ 1 && t4_value !== (t4_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*book*/ 1 && t6_value !== (t6_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*book*/ 1 && t8_value !== (t8_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*book*/ 1 && t10_value !== (t10_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumViews) + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*book*/ 1 && t12_value !== (t12_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumComments) + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*book*/ 1 && t14_value !== (t14_value = /*countDesign*/ ctx[1](/*book*/ ctx[0].NumLikes) + "")) set_data_dev(t14, t14_value);

    			if (dirty & /*book*/ 1) {
    				set_style(div15, "background", "url(\"" + /*book*/ ctx[0].UrlImg + "\")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div15);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(226:0) {#if book.UrlImg != ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*book*/ ctx[0].UrlImg != "") return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	let { book = [] } = $$props;

    	window.addEventListener("load", () => {
    		size();
    	});

    	window.addEventListener("resize", () => {
    		size();
    	});

    	const size = () => {
    		const CardId = document.getElementsByClassName("Card");

    		for (let i = 0; i < CardId.length; i++) {
    			CardId[i].style.height = CardId[i].offsetWidth * 1.57 + "px";
    			CardId[i].style.fontSize = CardId[i].offsetWidth * 0.13 + "px";
    		}
    	};

    	const countDesign = num => {
    		if (num >= 1000) {
    			return `${num / 1000}k`;
    		} else if (num >= 1000000) {
    			return `${num / 1000000}M`;
    		} else {
    			return num;
    		}
    	};

    	const descriptionDesign = text => {
    		let length = 400;

    		if (text.length > length) {
    			return text.substring(0, length - 3) + "...";
    		}

    		return text;
    	};

    	const writable_props = ["book"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("book" in $$props) $$invalidate(0, book = $$props.book);
    	};

    	$$self.$capture_state = () => ({
    		book,
    		size,
    		countDesign,
    		descriptionDesign
    	});

    	$$self.$inject_state = $$props => {
    		if ("book" in $$props) $$invalidate(0, book = $$props.book);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [book, countDesign, descriptionDesign];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { book: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get book() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set book(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ButtonIcon.svelte generated by Svelte v3.38.2 */

    const file$4 = "src\\components\\ButtonIcon.svelte";

    // (67:8) {:else }
    function create_else_block$1(ctx) {
    	let div0;
    	let p;
    	let t0_value = /*props*/ ctx[0].content + "";
    	let t0;
    	let t1;
    	let div1;
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			i = element("i");
    			add_location(p, file$4, 68, 16, 1590);
    			attr_dev(div0, "class", "ButtonIcon__Text svelte-a96nra");
    			add_location(div0, file$4, 67, 12, 1542);
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*props*/ ctx[0].icon) + " svelte-a96nra"));
    			add_location(i, file$4, 71, 16, 1694);
    			attr_dev(div1, "class", "ButtonIcon__Icon svelte-a96nra");
    			add_location(div1, file$4, 70, 12, 1646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*props*/ 1 && t0_value !== (t0_value = /*props*/ ctx[0].content + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*props*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*props*/ ctx[0].icon) + " svelte-a96nra"))) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(67:8) {:else }",
    		ctx
    	});

    	return block;
    }

    // (60:8) {#if props.position == 'left'}
    function create_if_block$1(ctx) {
    	let div0;
    	let i;
    	let i_class_value;
    	let t0;
    	let div1;
    	let p;
    	let t1_value = /*props*/ ctx[0].content + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*props*/ ctx[0].icon) + " svelte-a96nra"));
    			add_location(i, file$4, 61, 16, 1358);
    			attr_dev(div0, "class", "ButtonIcon__Icon svelte-a96nra");
    			add_location(div0, file$4, 60, 12, 1310);
    			add_location(p, file$4, 64, 16, 1468);
    			attr_dev(div1, "class", "ButtonIcon__Text svelte-a96nra");
    			add_location(div1, file$4, 63, 12, 1420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, i);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*props*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*props*/ ctx[0].icon) + " svelte-a96nra"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*props*/ 1 && t1_value !== (t1_value = /*props*/ ctx[0].content + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(60:8) {#if props.position == 'left'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let div1_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*props*/ ctx[0].position == "left") return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "ButtonIcon__Body svelte-a96nra");
    			add_location(div0, file$4, 58, 4, 1226);
    			attr_dev(div1, "class", div1_class_value = "ButtonIcon " + /*active*/ ctx[1] + " svelte-a96nra");
    			add_location(div1, file$4, 57, 0, 1187);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*active*/ 2 && div1_class_value !== (div1_class_value = "ButtonIcon " + /*active*/ ctx[1] + " svelte-a96nra")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonIcon", slots, []);
    	let { props = "" } = $$props;
    	let { active = "" } = $$props;
    	const writable_props = ["props", "active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("props" in $$props) $$invalidate(0, props = $$props.props);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ props, active });

    	$$self.$inject_state = $$props => {
    		if ("props" in $$props) $$invalidate(0, props = $$props.props);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [props, active];
    }

    class ButtonIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { props: 0, active: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonIcon",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get props() {
    		throw new Error("<ButtonIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<ButtonIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ButtonIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ButtonIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ContentCard.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\components\\ContentCard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (247:16) {#each data.data as book (book.IdBook)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let card;
    	let current;

    	card = new Card({
    			props: { book: /*book*/ ctx[10] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(card.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const card_changes = {};
    			if (dirty & /*data*/ 1) card_changes.book = /*book*/ ctx[10];
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(247:16) {#each data.data as book (book.IdBook)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div9;
    	let div0;
    	let t0;
    	let div7;
    	let div2;
    	let div1;
    	let logowrixy;
    	let t1;
    	let div3;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let div6;
    	let div4;
    	let buttonicon0;
    	let t3;
    	let div5;
    	let buttonicon1;
    	let t4;
    	let div8;
    	let current;
    	let mounted;
    	let dispose;
    	logowrixy = new LogoWrixy({ $$inline: true });
    	let each_value = /*data*/ ctx[0].data;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*book*/ ctx[10].IdBook;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	buttonicon0 = new ButtonIcon({
    			props: { props: /*HomeLeft*/ ctx[2] },
    			$$inline: true
    		});

    	buttonicon1 = new ButtonIcon({
    			props: {
    				props: /*HomeRight*/ ctx[3],
    				active: "true"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div7 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(logowrixy.$$.fragment);
    			t1 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div6 = element("div");
    			div4 = element("div");
    			create_component(buttonicon0.$$.fragment);
    			t3 = space();
    			div5 = element("div");
    			create_component(buttonicon1.$$.fragment);
    			t4 = space();
    			div8 = element("div");
    			attr_dev(div0, "class", "BodyCard__Anuncio svelte-1h2ijdh");
    			add_location(div0, file$3, 236, 4, 7078);
    			attr_dev(div1, "class", "loader svelte-1h2ijdh");
    			add_location(div1, file$3, 241, 16, 7232);
    			attr_dev(div2, "id", "LoaderCard");
    			attr_dev(div2, "class", "LoaderCard svelte-1h2ijdh");
    			add_location(div2, file$3, 240, 12, 7173);
    			attr_dev(div3, "id", "BodyCard");
    			attr_dev(div3, "class", "BodyCard__Cards svelte-1h2ijdh");
    			add_location(div3, file$3, 245, 12, 7344);
    			attr_dev(div4, "id", "buttonLeftHome");
    			attr_dev(div4, "class", "ButtonClick");
    			add_location(div4, file$3, 251, 16, 7587);
    			attr_dev(div5, "id", "buttonRightHome");
    			attr_dev(div5, "class", "ButtonClick");
    			add_location(div5, file$3, 255, 16, 7829);
    			attr_dev(div6, "class", "BodyCard_Buttons svelte-1h2ijdh");
    			add_location(div6, file$3, 250, 12, 7539);
    			attr_dev(div7, "class", "BodyCard__Center svelte-1h2ijdh");
    			add_location(div7, file$3, 239, 8, 7129);
    			attr_dev(div8, "class", "BodyCard__Anuncio svelte-1h2ijdh");
    			add_location(div8, file$3, 262, 4, 8114);
    			attr_dev(div9, "id", "CardsHome");
    			attr_dev(div9, "class", "BodyCard svelte-1h2ijdh");
    			add_location(div9, file$3, 235, 0, 7035);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div0);
    			append_dev(div9, t0);
    			append_dev(div9, div7);
    			append_dev(div7, div2);
    			append_dev(div2, div1);
    			mount_component(logowrixy, div1, null);
    			append_dev(div7, t1);
    			append_dev(div7, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div7, t2);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			mount_component(buttonicon0, div4, null);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			mount_component(buttonicon1, div5, null);
    			append_dev(div9, t4);
    			append_dev(div9, div8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div4,
    						"click",
    						function () {
    							if (is_function(/*updateStoreBook*/ ctx[4](/*$booksPage*/ ctx[1].currentPage, /*$booksPage*/ ctx[1].totalPages, "Left"))) /*updateStoreBook*/ ctx[4](/*$booksPage*/ ctx[1].currentPage, /*$booksPage*/ ctx[1].totalPages, "Left").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div5,
    						"click",
    						function () {
    							if (is_function(/*updateStoreBook*/ ctx[4](/*$booksPage*/ ctx[1].currentPage, /*$booksPage*/ ctx[1].totalPages, "Right"))) /*updateStoreBook*/ ctx[4](/*$booksPage*/ ctx[1].currentPage, /*$booksPage*/ ctx[1].totalPages, "Right").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0].data;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div3, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logowrixy.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(buttonicon0.$$.fragment, local);
    			transition_in(buttonicon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logowrixy.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(buttonicon0.$$.fragment, local);
    			transition_out(buttonicon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_component(logowrixy);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(buttonicon0);
    			destroy_component(buttonicon1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $booksPage;
    	validate_store(booksPage, "booksPage");
    	component_subscribe($$self, booksPage, $$value => $$invalidate(1, $booksPage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContentCard", slots, []);
    	let { data = [] } = $$props;

    	const HomeLeft = {
    		icon: "fas fa-arrow-circle-left",
    		content: "Anterior",
    		position: "left"
    	};

    	const HomeRight = {
    		icon: "fas fa-arrow-circle-right",
    		content: "Siguiente",
    		position: "right"
    	};

    	const size = () => {
    		const CardId = document.getElementsByClassName("Card");

    		for (let i = 0; i < CardId.length; i++) {
    			CardId[i].style.height = CardId[i].offsetWidth * 1.57 + "px";
    			CardId[i].style.fontSize = CardId[i].offsetWidth * 0.13 + "px";
    		}
    	};

    	const getDummyData = page => {
    		let totalBooks = 50; // Total ficticio de libros disponibles
    		let pageSize = 10;
    		let totalPages = Math.ceil(totalBooks / pageSize);
    		let start = (page - 1) * pageSize;
    		let books = [];

    		const images = [
    			"./img/posters/Libro1.png",
    			"./img/posters/Libro2.png",
    			"./img/posters/Libro3.png",
    			"./img/posters/Libro4.png"
    		];

    		for (let i = start; i < start + pageSize && i < totalBooks; i++) {
    			books.push({
    				IdBook: i + 1,
    				Title: `Libro ${i + 1}`,
    				UrlImg: images[Math.floor(Math.random() * images.length)], // Selección aleatoria de imagen
    				NumViews: Math.floor(Math.random() * 500),
    				NumComments: Math.floor(Math.random() * 100),
    				NumLikes: Math.floor(Math.random() * 200),
    				Descriptions: `Descripción del libro ${i + 1}`
    			});
    		}

    		return {
    			status: 200,
    			data: {
    				currentPage: page,
    				totalPages,
    				data: books
    			}
    		};
    	};

    	const fetchDummyData = page => {
    		return new Promise(resolve => {
    				setTimeout(
    					() => {
    						resolve(getDummyData(page));
    					},
    					2000
    				);
    			});
    	};

    	const queryPage = async page => {
    		const BodyCard = document.getElementById("BodyCard");
    		const loader = document.getElementById("LoaderCard");
    		BodyCard.style.opacity = "0";
    		loader.style.opacity = "1";

    		try {
    			let response = await fetchDummyData(page);

    			switch (response.status) {
    				case 200:
    					{
    						booksPage.set(response.data);
    						BodyCard.style.opacity = "1";
    						loader.style.opacity = "0";
    						$$invalidate(0, data = response.data.data);
    					}
    					break;
    				case 422:
    					{
    						alert("Se ha enviado una pagina incorrecta");
    					}
    					break;
    				case 204:
    					{
    						alert("No hay datos en esa pagina");
    					}
    					break;
    				default:
    					{
    						alert("Internal Error");
    						BodyCard.style.opacity = "1";
    						loader.style.opacity = "0";
    					}
    			}
    		} catch(e) {
    			console.log(e);
    			alert("Error en consulta");
    			BodyCard.style.opacity = "1";
    			loader.style.opacity = "0";
    		}
    	};

    	const updateStoreBook = async (current, total, navigation) => {
    		if (navigation === "Left") {
    			if (current > 1) {
    				let currentNew = current - 1;
    				await queryPage(currentNew);
    				buttonsActive();
    			}
    		} else {
    			if (current < total) {
    				let currentNew = current + 1;
    				await queryPage(currentNew);
    				buttonsActive();
    			}
    		}
    	};

    	const buttonsActive = () => {
    		if ($booksPage.currentPage === $booksPage.totalPages) {
    			const buttonRightHome = document.querySelector("#buttonRightHome > div");
    			buttonRightHome.style.backgroundColor = "var(--sub-secondary)";
    			const buttonLeftHome = document.querySelector("#buttonLeftHome > div");
    			buttonLeftHome.style.backgroundColor = "var(--primary)";
    		} else {
    			const buttonRightHome = document.querySelector("#buttonRightHome > div");
    			buttonRightHome.style.backgroundColor = "var(--primary)";
    			const buttonLeftHome = document.querySelector("#buttonLeftHome > div");
    			buttonLeftHome.style.backgroundColor = "var(--sub-secondary)";
    		}
    	};

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ContentCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Card,
    		ButtonIcon,
    		booksPage,
    		LogoWrixy,
    		data,
    		HomeLeft,
    		HomeRight,
    		size,
    		getDummyData,
    		fetchDummyData,
    		queryPage,
    		updateStoreBook,
    		buttonsActive,
    		$booksPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, $booksPage, HomeLeft, HomeRight, updateStoreBook];
    }

    class ContentCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContentCard",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get data() {
    		throw new Error("<ContentCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<ContentCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Home.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\components\\Home.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let buttong0;
    	let t0;
    	let buttong1;
    	let t1;
    	let buttong2;
    	let t2;
    	let buttong3;
    	let t3;
    	let contentcard;
    	let current;

    	buttong0 = new ButtonGeneral({
    			props: {
    				content: "Recomendados",
    				classb: "active"
    			},
    			$$inline: true
    		});

    	buttong1 = new ButtonGeneral({
    			props: { content: "Tendencias" },
    			$$inline: true
    		});

    	buttong2 = new ButtonGeneral({
    			props: { content: "Novedades" },
    			$$inline: true
    		});

    	buttong3 = new ButtonGeneral({
    			props: { content: "Adultos" },
    			$$inline: true
    		});

    	contentcard = new ContentCard({
    			props: { data: /*$booksPage*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(buttong0.$$.fragment);
    			t0 = space();
    			create_component(buttong1.$$.fragment);
    			t1 = space();
    			create_component(buttong2.$$.fragment);
    			t2 = space();
    			create_component(buttong3.$$.fragment);
    			t3 = space();
    			create_component(contentcard.$$.fragment);
    			attr_dev(div0, "class", "content-home svelte-j51871");
    			add_location(div0, file$2, 42, 12, 942);
    			attr_dev(div1, "class", "home-subnav__pad svelte-j51871");
    			add_location(div1, file$2, 41, 8, 898);
    			attr_dev(div2, "class", "home-subnav svelte-j51871");
    			add_location(div2, file$2, 40, 4, 863);
    			attr_dev(div3, "class", "home-body svelte-j51871");
    			add_location(div3, file$2, 39, 0, 834);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(buttong0, div0, null);
    			append_dev(div0, t0);
    			mount_component(buttong1, div0, null);
    			append_dev(div0, t1);
    			mount_component(buttong2, div0, null);
    			append_dev(div0, t2);
    			mount_component(buttong3, div0, null);
    			append_dev(div3, t3);
    			mount_component(contentcard, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const contentcard_changes = {};
    			if (dirty & /*$booksPage*/ 1) contentcard_changes.data = /*$booksPage*/ ctx[0];
    			contentcard.$set(contentcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttong0.$$.fragment, local);
    			transition_in(buttong1.$$.fragment, local);
    			transition_in(buttong2.$$.fragment, local);
    			transition_in(buttong3.$$.fragment, local);
    			transition_in(contentcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttong0.$$.fragment, local);
    			transition_out(buttong1.$$.fragment, local);
    			transition_out(buttong2.$$.fragment, local);
    			transition_out(buttong3.$$.fragment, local);
    			transition_out(contentcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(buttong0);
    			destroy_component(buttong1);
    			destroy_component(buttong2);
    			destroy_component(buttong3);
    			destroy_component(contentcard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $booksPage;
    	validate_store(booksPage, "booksPage");
    	component_subscribe($$self, booksPage, $$value => $$invalidate(0, $booksPage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		booksPage,
    		ButtonG: ButtonGeneral,
    		ContentCard,
    		$booksPage
    	});

    	return [$booksPage];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Page.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\components\\Page.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let headerg;
    	let t;
    	let home;
    	let current;
    	headerg = new HeaderG({ $$inline: true });
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(headerg.$$.fragment);
    			t = space();
    			create_component(home.$$.fragment);
    			attr_dev(div, "class", "bodyclass svelte-101qy4e");
    			add_location(div, file$1, 10, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(headerg, div, null);
    			append_dev(div, t);
    			mount_component(home, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(headerg.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(headerg.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(headerg);
    			destroy_component(home);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Page", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ HeaderG, Home });
    	return [];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (169:4) {:else}
    function create_else_block(ctx) {
    	let div1;
    	let div0;
    	let logowrixy;
    	let current;
    	logowrixy = new LogoWrixy({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(logowrixy.$$.fragment);
    			attr_dev(div0, "class", "loader svelte-1wx1gso");
    			add_location(div0, file, 170, 12, 4441);
    			attr_dev(div1, "class", "loader-container svelte-1wx1gso");
    			add_location(div1, file, 169, 8, 4397);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(logowrixy, div0, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logowrixy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logowrixy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(logowrixy);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(169:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (165:4) {#if data.length > 0}
    function create_if_block(ctx) {
    	let div;
    	let page;
    	let current;
    	page = new Page({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(page.$$.fragment);
    			add_location(div, file, 165, 8, 4332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(page, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(page);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(165:4) {#if data.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-1wx1gso");
    			add_location(main, file, 163, 0, 4289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let data = [];

    	const getDummyData = page => {
    		let totalBooks = 50; // Total ficticio de libros disponibles
    		let pageSize = 10;
    		let totalPages = Math.ceil(totalBooks / pageSize);
    		let start = (page - 1) * pageSize;
    		let books = [];

    		const images = [
    			"./img/posters/Libro1.png",
    			"./img/posters/Libro2.png",
    			"./img/posters/Libro3.png",
    			"./img/posters/Libro4.png"
    		];

    		for (let i = start; i < start + pageSize && i < totalBooks; i++) {
    			books.push({
    				IdBook: i + 1,
    				Title: `Libro ${i + 1}`,
    				UrlImg: images[Math.floor(Math.random() * images.length)], // Selección aleatoria de imagen
    				NumViews: Math.floor(Math.random() * 500),
    				NumComments: Math.floor(Math.random() * 100),
    				NumLikes: Math.floor(Math.random() * 200),
    				Descriptions: `Descripción del libro ${i + 1}`
    			});
    		}

    		return {
    			status: 200,
    			data: {
    				currentPage: page,
    				totalPages,
    				data: books
    			}
    		};
    	};

    	const fetchDummyData = page => {
    		return new Promise(resolve => {
    				setTimeout(
    					() => {
    						resolve(getDummyData(page));
    					},
    					2000
    				);
    			});
    	};

    	onMount(async () => {
    		try {
    			// Simulación de respuesta de la API
    			let response = await fetchDummyData(1);

    			// Verificación del status de la respuesta simulado
    			switch (response.status) {
    				case 200:
    					{
    						booksPage.set(response.data);
    						$$invalidate(0, data = response.data.data);
    					}
    					break;
    				case 422:
    					{
    						alert("Se ha enviado una pagina incorrecta");
    					}
    					break;
    				case 204:
    					{
    						alert("No hay datos en esa pagina");
    					}
    					break;
    				default:
    					{
    						alert("Internal Error");
    					}
    			}
    		} catch(e) {
    			alert("Error en consulta");
    			console.log(e);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		LogoWrixy,
    		Page,
    		booksPage,
    		data,
    		getDummyData,
    		fetchDummyData
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
