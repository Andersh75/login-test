var MyModule = (function (exports) {
    'use strict';

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * An expression marker with embedded unique key to avoid collision with
     * possible text in templates.
     */
    const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
    /**
     * An expression marker used text-positions, not attribute positions,
     * in template.
     */
    const nodeMarker = `<!--${marker}-->`;
    const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
    const rewritesStyleAttribute = (() => {
        const el = document.createElement('div');
        el.setAttribute('style', '{{bad value}}');
        return el.getAttribute('style') !== '{{bad value}}';
    })();
    /**
     * An updateable Template that tracks the location of dynamic parts.
     */
    class Template {
        constructor(result, element) {
            this.parts = [];
            this.element = element;
            let index = -1;
            let partIndex = 0;
            const nodesToRemove = [];
            const _prepareTemplate = (template) => {
                const content = template.content;
                // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
                // null
                const walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                       NodeFilter.SHOW_TEXT */, null, false);
                // The actual previous node, accounting for removals: if a node is removed
                // it will never be the previousNode.
                let previousNode;
                // Used to set previousNode at the top of the loop.
                let currentNode;
                while (walker.nextNode()) {
                    index++;
                    previousNode = currentNode;
                    const node = currentNode = walker.currentNode;
                    if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                        if (node.hasAttributes()) {
                            const attributes = node.attributes;
                            // Per
                            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                            // attributes are not guaranteed to be returned in document order.
                            // In particular, Edge/IE can return them out of order, so we cannot
                            // assume a correspondance between part index and attribute index.
                            let count = 0;
                            for (let i = 0; i < attributes.length; i++) {
                                if (attributes[i].value.indexOf(marker) >= 0) {
                                    count++;
                                }
                            }
                            while (count-- > 0) {
                                // Get the template literal section leading up to the first
                                // expression in this attribute
                                const stringForPart = result.strings[partIndex];
                                // Find the attribute name
                                const name = lastAttributeNameRegex.exec(stringForPart)[2];
                                // Find the corresponding attribute
                                // If the attribute name contains special characters, lower-case
                                // it so that on XML nodes with case-sensitive getAttribute() we
                                // can still find the attribute, which will have been lower-cased
                                // by the parser.
                                //
                                // If the attribute name doesn't contain special character, it's
                                // important to _not_ lower-case it, in case the name is
                                // case-sensitive, like with XML attributes like "viewBox".
                                const attributeLookupName = (rewritesStyleAttribute && name === 'style') ?
                                    'style$' :
                                    /^[a-zA-Z-]*$/.test(name) ? name : name.toLowerCase();
                                const attributeValue = node.getAttribute(attributeLookupName);
                                const strings = attributeValue.split(markerRegex);
                                this.parts.push({ type: 'attribute', index, name, strings });
                                node.removeAttribute(attributeLookupName);
                                partIndex += strings.length - 1;
                            }
                        }
                        if (node.tagName === 'TEMPLATE') {
                            _prepareTemplate(node);
                        }
                    }
                    else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                        const nodeValue = node.nodeValue;
                        if (nodeValue.indexOf(marker) < 0) {
                            continue;
                        }
                        const parent = node.parentNode;
                        const strings = nodeValue.split(markerRegex);
                        const lastIndex = strings.length - 1;
                        // We have a part for each match found
                        partIndex += lastIndex;
                        // Generate a new text node for each literal section
                        // These nodes are also used as the markers for node parts
                        for (let i = 0; i < lastIndex; i++) {
                            parent.insertBefore((strings[i] === '') ? createMarker() :
                                document.createTextNode(strings[i]), node);
                            this.parts.push({ type: 'node', index: index++ });
                        }
                        parent.insertBefore(strings[lastIndex] === '' ?
                            createMarker() :
                            document.createTextNode(strings[lastIndex]), node);
                        nodesToRemove.push(node);
                    }
                    else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                        if (node.nodeValue === marker) {
                            const parent = node.parentNode;
                            // Add a new marker node to be the startNode of the Part if any of
                            // the following are true:
                            //  * We don't have a previousSibling
                            //  * previousSibling is being removed (thus it's not the
                            //    `previousNode`)
                            //  * previousSibling is not a Text node
                            //
                            // TODO(justinfagnani): We should be able to use the previousNode
                            // here as the marker node and reduce the number of extra nodes we
                            // add to a template. See
                            // https://github.com/PolymerLabs/lit-html/issues/147
                            const previousSibling = node.previousSibling;
                            if (previousSibling === null || previousSibling !== previousNode ||
                                previousSibling.nodeType !== Node.TEXT_NODE) {
                                parent.insertBefore(createMarker(), node);
                            }
                            else {
                                index--;
                            }
                            this.parts.push({ type: 'node', index: index++ });
                            nodesToRemove.push(node);
                            // If we don't have a nextSibling add a marker node.
                            // We don't have to check if the next node is going to be removed,
                            // because that node will induce a new marker if so.
                            if (node.nextSibling === null) {
                                parent.insertBefore(createMarker(), node);
                            }
                            else {
                                index--;
                            }
                            currentNode = previousNode;
                            partIndex++;
                        }
                        else {
                            let i = -1;
                            while ((i = node.nodeValue.indexOf(marker, i + 1)) !== -1) {
                                // Comment node has a binding marker inside, make an inactive part
                                // The binding won't work, but subsequent bindings will
                                // TODO (justinfagnani): consider whether it's even worth it to
                                // make bindings in comments work
                                this.parts.push({ type: 'node', index: -1 });
                            }
                        }
                    }
                }
            };
            _prepareTemplate(element);
            // Remove text binding nodes after the walk to not disturb the TreeWalker
            for (const n of nodesToRemove) {
                n.parentNode.removeChild(n);
            }
        }
    }
    const isTemplatePartActive = (part) => part.index !== -1;
    // Allows `document.createComment('')` to be renamed for a
    // small manual size-savings.
    const createMarker = () => document.createComment('');
    /**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#attributes-0
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-character
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */
    const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const walkerNodeFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT;
    /**
     * Removes the list of nodes from a Template safely. In addition to removing
     * nodes from the Template, the Template part indices are updated to match
     * the mutated Template DOM.
     *
     * As the template is walked the removal state is tracked and
     * part indices are adjusted as needed.
     *
     * div
     *   div#1 (remove) <-- start removing (removing node is div#1)
     *     div
     *       div#2 (remove)  <-- continue removing (removing node is still div#1)
     *         div
     * div <-- stop removing since previous sibling is the removing node (div#1,
     * removed 4 nodes)
     */
    function removeNodesFromTemplate(template, nodesToRemove) {
        const { element: { content }, parts } = template;
        const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
        let partIndex = nextActiveIndexInTemplateParts(parts);
        let part = parts[partIndex];
        let nodeIndex = -1;
        let removeCount = 0;
        const nodesToRemoveInTemplate = [];
        let currentRemovingNode = null;
        while (walker.nextNode()) {
            nodeIndex++;
            const node = walker.currentNode;
            // End removal if stepped past the removing node
            if (node.previousSibling === currentRemovingNode) {
                currentRemovingNode = null;
            }
            // A node to remove was found in the template
            if (nodesToRemove.has(node)) {
                nodesToRemoveInTemplate.push(node);
                // Track node we're removing
                if (currentRemovingNode === null) {
                    currentRemovingNode = node;
                }
            }
            // When removing, increment count by which to adjust subsequent part indices
            if (currentRemovingNode !== null) {
                removeCount++;
            }
            while (part !== undefined && part.index === nodeIndex) {
                // If part is in a removed node deactivate it by setting index to -1 or
                // adjust the index as needed.
                part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
                // go to the next active part.
                partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                part = parts[partIndex];
            }
        }
        nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
    }
    const countNodes = (node) => {
        let count = (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) ? 0 : 1;
        const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
        while (walker.nextNode()) {
            count++;
        }
        return count;
    };
    const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
        for (let i = startIndex + 1; i < parts.length; i++) {
            const part = parts[i];
            if (isTemplatePartActive(part)) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Inserts the given node into the Template, optionally before the given
     * refNode. In addition to inserting the node into the Template, the Template
     * part indices are updated to match the mutated Template DOM.
     */
    function insertNodeIntoTemplate(template, node, refNode = null) {
        const { element: { content }, parts } = template;
        // If there's no refNode, then put node at end of template.
        // No part indices need to be shifted in this case.
        if (refNode === null || refNode === undefined) {
            content.appendChild(node);
            return;
        }
        const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
        let partIndex = nextActiveIndexInTemplateParts(parts);
        let insertCount = 0;
        let walkerIndex = -1;
        while (walker.nextNode()) {
            walkerIndex++;
            const walkerNode = walker.currentNode;
            if (walkerNode === refNode) {
                insertCount = countNodes(node);
                refNode.parentNode.insertBefore(node, refNode);
            }
            while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
                // If we've inserted the node, simply adjust all subsequent parts
                if (insertCount > 0) {
                    while (partIndex !== -1) {
                        parts[partIndex].index += insertCount;
                        partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                    }
                    return;
                }
                partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            }
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const isCEPolyfill = window.customElements !== undefined &&
        window.customElements.polyfillWrapFlushCallback !== undefined;
    /**
     * Removes nodes, starting from `startNode` (inclusive) to `endNode`
     * (exclusive), from `container`.
     */
    const removeNodes = (container, startNode, endNode = null) => {
        let node = startNode;
        while (node !== endNode) {
            const n = node.nextSibling;
            container.removeChild(node);
            node = n;
        }
    };

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const directives = new WeakMap();
    const isDirective = (o) => typeof o === 'function' && directives.has(o);

    /**
     * A sentinel value that signals that a value was handled by a directive and
     * should not be written to the DOM.
     */
    const noChange = {};

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */
    class TemplateInstance {
        constructor(template, processor, getTemplate) {
            this._parts = [];
            this.template = template;
            this.processor = processor;
            this._getTemplate = getTemplate;
        }
        update(values) {
            let i = 0;
            for (const part of this._parts) {
                if (part !== undefined) {
                    part.setValue(values[i]);
                }
                i++;
            }
            for (const part of this._parts) {
                if (part !== undefined) {
                    part.commit();
                }
            }
        }
        _clone() {
            // When using the Custom Elements polyfill, clone the node, rather than
            // importing it, to keep the fragment in the template's document. This
            // leaves the fragment inert so custom elements won't upgrade and
            // potentially modify their contents by creating a polyfilled ShadowRoot
            // while we traverse the tree.
            const fragment = isCEPolyfill ?
                this.template.element.content.cloneNode(true) :
                document.importNode(this.template.element.content, true);
            const parts = this.template.parts;
            let partIndex = 0;
            let nodeIndex = 0;
            const _prepareInstance = (fragment) => {
                // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
                // null
                const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
                let node = walker.nextNode();
                // Loop through all the nodes and parts of a template
                while (partIndex < parts.length && node !== null) {
                    const part = parts[partIndex];
                    // Consecutive Parts may have the same node index, in the case of
                    // multiple bound attributes on an element. So each iteration we either
                    // increment the nodeIndex, if we aren't on a node with a part, or the
                    // partIndex if we are. By not incrementing the nodeIndex when we find a
                    // part, we allow for the next part to be associated with the current
                    // node if neccessasry.
                    if (!isTemplatePartActive(part)) {
                        this._parts.push(undefined);
                        partIndex++;
                    }
                    else if (nodeIndex === part.index) {
                        if (part.type === 'node') {
                            const part = this.processor.handleTextExpression(this._getTemplate);
                            part.insertAfterNode(node);
                            this._parts.push(part);
                        }
                        else {
                            this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings));
                        }
                        partIndex++;
                    }
                    else {
                        nodeIndex++;
                        if (node.nodeName === 'TEMPLATE') {
                            _prepareInstance(node.content);
                        }
                        node = walker.nextNode();
                    }
                }
            };
            _prepareInstance(fragment);
            if (isCEPolyfill) {
                document.adoptNode(fragment);
                customElements.upgrade(fragment);
            }
            return fragment;
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */
    class TemplateResult {
        constructor(strings, values, type, processor) {
            this.strings = strings;
            this.values = values;
            this.type = type;
            this.processor = processor;
        }
        /**
         * Returns a string of HTML used to create a <template> element.
         */
        getHTML() {
            const l = this.strings.length - 1;
            let html = '';
            let isTextBinding = true;
            for (let i = 0; i < l; i++) {
                const s = this.strings[i];
                html += s;
                const close = s.lastIndexOf('>');
                // We're in a text position if the previous string closed its last tag, an
                // attribute position if the string opened an unclosed tag, and unchanged
                // if the string had no brackets at all:
                //
                // "...>...": text position. open === -1, close > -1
                // "...<...": attribute position. open > -1
                // "...": no change. open === -1, close === -1
                isTextBinding =
                    (close > -1 || isTextBinding) && s.indexOf('<', close + 1) === -1;
                if (!isTextBinding && rewritesStyleAttribute) {
                    html = html.replace(lastAttributeNameRegex, (match, p1, p2, p3) => {
                        return (p2 === 'style') ? `${p1}style$${p3}` : match;
                    });
                }
                html += isTextBinding ? nodeMarker : marker;
            }
            html += this.strings[l];
            return html;
        }
        getTemplateElement() {
            const template = document.createElement('template');
            template.innerHTML = this.getHTML();
            return template;
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const isPrimitive = (value) => (value === null ||
        !(typeof value === 'object' || typeof value === 'function'));
    /**
     * Sets attribute values for AttributeParts, so that the value is only set once
     * even if there are multiple parts for an attribute.
     */
    class AttributeCommitter {
        constructor(element, name, strings) {
            this.dirty = true;
            this.element = element;
            this.name = name;
            this.strings = strings;
            this.parts = [];
            for (let i = 0; i < strings.length - 1; i++) {
                this.parts[i] = this._createPart();
            }
        }
        /**
         * Creates a single part. Override this to create a differnt type of part.
         */
        _createPart() {
            return new AttributePart(this);
        }
        _getValue() {
            const strings = this.strings;
            const l = strings.length - 1;
            let text = '';
            for (let i = 0; i < l; i++) {
                text += strings[i];
                const part = this.parts[i];
                if (part !== undefined) {
                    const v = part.value;
                    if (v != null &&
                        (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                        for (const t of v) {
                            text += typeof t === 'string' ? t : String(t);
                        }
                    }
                    else {
                        text += typeof v === 'string' ? v : String(v);
                    }
                }
            }
            text += strings[l];
            return text;
        }
        commit() {
            if (this.dirty) {
                this.dirty = false;
                this.element.setAttribute(this.name, this._getValue());
            }
        }
    }
    class AttributePart {
        constructor(comitter) {
            this.value = undefined;
            this.committer = comitter;
        }
        setValue(value) {
            if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
                this.value = value;
                // If the value is a not a directive, dirty the committer so that it'll
                // call setAttribute. If the value is a directive, it'll dirty the
                // committer if it calls setValue().
                if (!isDirective(value)) {
                    this.committer.dirty = true;
                }
            }
        }
        commit() {
            while (isDirective(this.value)) {
                const directive$$1 = this.value;
                this.value = noChange;
                directive$$1(this);
            }
            if (this.value === noChange) {
                return;
            }
            this.committer.commit();
        }
    }
    class NodePart {
        constructor(templateFactory) {
            this.value = undefined;
            this._pendingValue = undefined;
            this.templateFactory = templateFactory;
        }
        /**
         * Inserts this part into a container.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendInto(container) {
            this.startNode = container.appendChild(createMarker());
            this.endNode = container.appendChild(createMarker());
        }
        /**
         * Inserts this part between `ref` and `ref`'s next sibling. Both `ref` and
         * its next sibling must be static, unchanging nodes such as those that appear
         * in a literal section of a template.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterNode(ref) {
            this.startNode = ref;
            this.endNode = ref.nextSibling;
        }
        /**
         * Appends this part into a parent part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendIntoPart(part) {
            part._insert(this.startNode = createMarker());
            part._insert(this.endNode = createMarker());
        }
        /**
         * Appends this part after `ref`
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterPart(ref) {
            ref._insert(this.startNode = createMarker());
            this.endNode = ref.endNode;
            ref.endNode = this.startNode;
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (isDirective(this._pendingValue)) {
                const directive$$1 = this._pendingValue;
                this._pendingValue = noChange;
                directive$$1(this);
            }
            const value = this._pendingValue;
            if (value === noChange) {
                return;
            }
            if (isPrimitive(value)) {
                if (value !== this.value) {
                    this._commitText(value);
                }
            }
            else if (value instanceof TemplateResult) {
                this._commitTemplateResult(value);
            }
            else if (value instanceof Node) {
                this._commitNode(value);
            }
            else if (Array.isArray(value) || value[Symbol.iterator]) {
                this._commitIterable(value);
            }
            else if (value.then !== undefined) {
                this._commitPromise(value);
            }
            else {
                // Fallback, will render the string representation
                this._commitText(value);
            }
        }
        _insert(node) {
            this.endNode.parentNode.insertBefore(node, this.endNode);
        }
        _commitNode(value) {
            if (this.value === value) {
                return;
            }
            this.clear();
            this._insert(value);
            this.value = value;
        }
        _commitText(value) {
            const node = this.startNode.nextSibling;
            value = value == null ? '' : value;
            if (node === this.endNode.previousSibling &&
                node.nodeType === Node.TEXT_NODE) {
                // If we only have a single text node between the markers, we can just
                // set its value, rather than replacing it.
                // TODO(justinfagnani): Can we just check if this.value is primitive?
                node.textContent = value;
            }
            else {
                this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
            }
            this.value = value;
        }
        _commitTemplateResult(value) {
            const template = this.templateFactory(value);
            if (this.value && this.value.template === template) {
                this.value.update(value.values);
            }
            else {
                // Make sure we propagate the template processor from the TemplateResult
                // so that we use it's syntax extension, etc. The template factory comes
                // from the render function so that it can control caching.
                const instance = new TemplateInstance(template, value.processor, this.templateFactory);
                const fragment = instance._clone();
                instance.update(value.values);
                this._commitNode(fragment);
                this.value = instance;
            }
        }
        _commitIterable(value) {
            // For an Iterable, we create a new InstancePart per item, then set its
            // value to the item. This is a little bit of overhead for every item in
            // an Iterable, but it lets us recurse easily and efficiently update Arrays
            // of TemplateResults that will be commonly returned from expressions like:
            // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
            // If _value is an array, then the previous render was of an
            // iterable and _value will contain the NodeParts from the previous
            // render. If _value is not an array, clear this part and make a new
            // array for NodeParts.
            if (!Array.isArray(this.value)) {
                this.value = [];
                this.clear();
            }
            // Lets us keep track of how many items we stamped so we can clear leftover
            // items from a previous render
            const itemParts = this.value;
            let partIndex = 0;
            let itemPart;
            for (const item of value) {
                // Try to reuse an existing part
                itemPart = itemParts[partIndex];
                // If no existing part, create a new one
                if (itemPart === undefined) {
                    itemPart = new NodePart(this.templateFactory);
                    itemParts.push(itemPart);
                    if (partIndex === 0) {
                        itemPart.appendIntoPart(this);
                    }
                    else {
                        itemPart.insertAfterPart(itemParts[partIndex - 1]);
                    }
                }
                itemPart.setValue(item);
                itemPart.commit();
                partIndex++;
            }
            if (partIndex < itemParts.length) {
                // Truncate the parts array so _value reflects the current state
                itemParts.length = partIndex;
                this.clear(itemPart && itemPart.endNode);
            }
        }
        _commitPromise(value) {
            this.value = value;
            value.then((v) => {
                if (this.value === value) {
                    this.setValue(v);
                    this.commit();
                }
            });
        }
        clear(startNode = this.startNode) {
            removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
        }
    }
    /**
     * Implements a boolean attribute, roughly as defined in the HTML
     * specification.
     *
     * If the value is truthy, then the attribute is present with a value of
     * ''. If the value is falsey, the attribute is removed.
     */
    class BooleanAttributePart {
        constructor(element, name, strings) {
            this.value = undefined;
            this._pendingValue = undefined;
            if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
                throw new Error('Boolean attributes can only contain a single expression');
            }
            this.element = element;
            this.name = name;
            this.strings = strings;
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (isDirective(this._pendingValue)) {
                const directive$$1 = this._pendingValue;
                this._pendingValue = noChange;
                directive$$1(this);
            }
            if (this._pendingValue === noChange) {
                return;
            }
            const value = !!this._pendingValue;
            if (this.value !== value) {
                if (value) {
                    this.element.setAttribute(this.name, '');
                }
                else {
                    this.element.removeAttribute(this.name);
                }
            }
            this.value = value;
            this._pendingValue = noChange;
        }
    }
    /**
     * Sets attribute values for PropertyParts, so that the value is only set once
     * even if there are multiple parts for a property.
     *
     * If an expression controls the whole property value, then the value is simply
     * assigned to the property under control. If there are string literals or
     * multiple expressions, then the strings are expressions are interpolated into
     * a string first.
     */
    class PropertyCommitter extends AttributeCommitter {
        constructor(element, name, strings) {
            super(element, name, strings);
            this.single =
                (strings.length === 2 && strings[0] === '' && strings[1] === '');
        }
        _createPart() {
            return new PropertyPart(this);
        }
        _getValue() {
            if (this.single) {
                return this.parts[0].value;
            }
            return super._getValue();
        }
        commit() {
            if (this.dirty) {
                this.dirty = false;
                this.element[this.name] = this._getValue();
            }
        }
    }
    class PropertyPart extends AttributePart {
    }
    class EventPart {
        constructor(element, eventName) {
            this.value = undefined;
            this._pendingValue = undefined;
            this.element = element;
            this.eventName = eventName;
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (isDirective(this._pendingValue)) {
                const directive$$1 = this._pendingValue;
                this._pendingValue = noChange;
                directive$$1(this);
            }
            if (this._pendingValue === noChange) {
                return;
            }
            if ((this._pendingValue == null) !== (this.value == null)) {
                if (this._pendingValue == null) {
                    this.element.removeEventListener(this.eventName, this);
                }
                else {
                    this.element.addEventListener(this.eventName, this);
                }
            }
            this.value = this._pendingValue;
            this._pendingValue = noChange;
        }
        handleEvent(event) {
            if (typeof this.value === 'function') {
                this.value.call(this.element, event);
            }
            else if (typeof this.value.handleEvent === 'function') {
                this.value.handleEvent(event);
            }
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * The default TemplateFactory which caches Templates keyed on
     * result.type and result.strings.
     */
    function templateFactory(result) {
        let templateCache = templateCaches.get(result.type);
        if (templateCache === undefined) {
            templateCache = new Map();
            templateCaches.set(result.type, templateCache);
        }
        let template = templateCache.get(result.strings);
        if (template === undefined) {
            template = new Template(result, result.getTemplateElement());
            templateCache.set(result.strings, template);
        }
        return template;
    }
    // The first argument to JS template tags retain identity across multiple
    // calls to a tag for the same literal, so we can cache work done per literal
    // in a Map.
    const templateCaches = new Map();

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const parts = new WeakMap();
    /**
     * Renders a template to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result a TemplateResult created by evaluating a template tag like
     *     `html` or `svg`.
     * @param container A DOM parent to render to. The entire contents are either
     *     replaced, or efficiently updated if the same result type was previous
     *     rendered there.
     * @param templateFactory a function to create a Template or retreive one from
     *     cache.
     */
    function render(result, container, templateFactory$$1 = templateFactory) {
        let part = parts.get(container);
        if (part === undefined) {
            removeNodes(container, container.firstChild);
            parts.set(container, part = new NodePart(templateFactory$$1));
            part.appendInto(container);
        }
        part.setValue(result);
        part.commit();
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * Creates Parts when a template is instantiated.
     */
    class DefaultTemplateProcessor {
        /**
         * Create parts for an attribute-position binding, given the event, attribute
         * name, and string literals.
         *
         * @param element The element containing the binding
         * @param name  The attribute name
         * @param strings The string literals. There are always at least two strings,
         *   event for fully-controlled bindings with a single expression.
         */
        handleAttributeExpressions(element, name, strings) {
            const prefix = name[0];
            if (prefix === '.') {
                const comitter = new PropertyCommitter(element, name.slice(1), strings);
                return comitter.parts;
            }
            if (prefix === '@') {
                return [new EventPart(element, name.slice(1))];
            }
            if (prefix === '?') {
                return [new BooleanAttributePart(element, name.slice(1), strings)];
            }
            const comitter = new AttributeCommitter(element, name, strings);
            return comitter.parts;
        }
        /**
         * Create parts for a text-position binding.
         * @param templateFactory
         */
        handleTextExpression(templateFactory) {
            return new NodePart(templateFactory);
        }
    }
    const defaultTemplateProcessor = new DefaultTemplateProcessor();

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */
    const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // Get a key to lookup in `templateCaches`.
    const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
    let compatibleShadyCSSVersion = true;
    if (typeof window.ShadyCSS === 'undefined') {
        compatibleShadyCSSVersion = false;
    }
    else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
        console.warn(`Incompatible ShadyCSS version detected.` +
            `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and` +
            `@webcomponents/shadycss@1.3.1.`);
        compatibleShadyCSSVersion = false;
    }
    /**
     * Template factory which scopes template DOM using ShadyCSS.
     * @param scopeName {string}
     */
    const shadyTemplateFactory = (scopeName) => (result) => {
        const cacheKey = getTemplateCacheKey(result.type, scopeName);
        let templateCache = templateCaches.get(cacheKey);
        if (templateCache === undefined) {
            templateCache = new Map();
            templateCaches.set(cacheKey, templateCache);
        }
        let template = templateCache.get(result.strings);
        if (template === undefined) {
            const element = result.getTemplateElement();
            if (compatibleShadyCSSVersion) {
                window.ShadyCSS.prepareTemplateDom(element, scopeName);
            }
            template = new Template(result, element);
            templateCache.set(result.strings, template);
        }
        return template;
    };
    const TEMPLATE_TYPES = ['html', 'svg'];
    /**
     * Removes all style elements from Templates for the given scopeName.
     */
    function removeStylesFromLitTemplates(scopeName) {
        TEMPLATE_TYPES.forEach((type) => {
            const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
            if (templates !== undefined) {
                templates.forEach((template) => {
                    const { element: { content } } = template;
                    // IE 11 doesn't support the iterable param Set constructor
                    const styles = new Set();
                    Array.from(content.querySelectorAll('style')).forEach((s) => {
                        styles.add(s);
                    });
                    removeNodesFromTemplate(template, styles);
                });
            }
        });
    }
    const shadyRenderSet = new Set();
    /**
     * For the given scope name, ensures that ShadyCSS style scoping is performed.
     * This is done just once per scope name so the fragment and template cannot
     * be modified.
     * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
     * to be scoped and appended to the document
     * (2) removes style elements from all lit-html Templates for this scope name.
     *
     * Note, <style> elements can only be placed into templates for the
     * initial rendering of the scope. If <style> elements are included in templates
     * dynamically rendered to the scope (after the first scope render), they will
     * not be scoped and the <style> will be left in the template and rendered
     * output.
     */
    const prepareTemplateStyles = (renderedDOM, template, scopeName) => {
        shadyRenderSet.add(scopeName);
        // Move styles out of rendered DOM and store.
        const styles = renderedDOM.querySelectorAll('style');
        // If there are no styles, there's no work to do.
        if (styles.length === 0) {
            return;
        }
        const condensedStyle = document.createElement('style');
        // Collect styles into a single style. This helps us make sure ShadyCSS
        // manipulations will not prevent us from being able to fix up template
        // part indices.
        // NOTE: collecting styles is inefficient for browsers but ShadyCSS
        // currently does this anyway. When it does not, this should be changed.
        for (let i = 0; i < styles.length; i++) {
            const style = styles[i];
            style.parentNode.removeChild(style);
            condensedStyle.textContent += style.textContent;
        }
        // Remove styles from nested templates in this scope.
        removeStylesFromLitTemplates(scopeName);
        // And then put the condensed style into the "root" template passed in as
        // `template`.
        insertNodeIntoTemplate(template, condensedStyle, template.element.content.firstChild);
        // Note, it's important that ShadyCSS gets the template that `lit-html`
        // will actually render so that it can update the style inside when
        // needed (e.g. @apply native Shadow DOM case).
        window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
        if (window.ShadyCSS.nativeShadow) {
            // When in native Shadow DOM, re-add styling to rendered content using
            // the style ShadyCSS produced.
            const style = template.element.content.querySelector('style');
            renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
        }
        else {
            // When not in native Shadow DOM, at this point ShadyCSS will have
            // removed the style from the lit template and parts will be broken as a
            // result. To fix this, we put back the style node ShadyCSS removed
            // and then tell lit to remove that node from the template.
            // NOTE, ShadyCSS creates its own style so we can safely add/remove
            // `condensedStyle` here.
            template.element.content.insertBefore(condensedStyle, template.element.content.firstChild);
            const removes = new Set();
            removes.add(condensedStyle);
            removeNodesFromTemplate(template, removes);
        }
    };
    function render$1(result, container, scopeName) {
        const hasRendered = parts.has(container);
        render(result, container, shadyTemplateFactory(scopeName));
        // When rendering a TemplateResult, scope the template with ShadyCSS
        if (container instanceof ShadowRoot && compatibleShadyCSSVersion &&
            result instanceof TemplateResult) {
            // Scope the element template one time only for this scope.
            if (!shadyRenderSet.has(scopeName)) {
                const part = parts.get(container);
                const instance = part.value;
                prepareTemplateStyles(container, instance.template, scopeName);
            }
            // Update styling if this is the initial render to this container.
            if (!hasRendered) {
                window.ShadyCSS.styleElement(container.host);
            }
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // serializer/deserializers for boolean attribute
    const fromBooleanAttribute = (value) => value !== null;
    const toBooleanAttribute = (value) => value ? '' : null;
    /**
     * Change function that returns true if `value` is different from `oldValue`.
     * This method is used as the default for a property's `hasChanged` function.
     */
    const notEqual = (value, old) => {
        // This ensures (old==NaN, value==NaN) always returns false
        return old !== value && (old === old || value === value);
    };
    const defaultPropertyDeclaration = {
        attribute: true,
        type: String,
        reflect: false,
        hasChanged: notEqual
    };
    const microtaskPromise = new Promise((resolve) => resolve(true));
    const STATE_HAS_UPDATED = 1;
    const STATE_UPDATE_REQUESTED = 1 << 2;
    const STATE_IS_REFLECTING = 1 << 3;
    /**
     * Base element class which manages element properties and attributes. When
     * properties change, the `update` method is asynchronously called. This method
     * should be supplied by subclassers to render updates as desired.
     */
    class UpdatingElement extends HTMLElement {
        constructor() {
            super();
            this._updateState = 0;
            this._instanceProperties = undefined;
            this._updatePromise = microtaskPromise;
            /**
             * Map with keys for any properties that have changed since the last
             * update cycle with previous values.
             */
            this._changedProperties = new Map();
            /**
             * Map with keys of properties that should be reflected when updated.
             */
            this._reflectingProperties = undefined;
            this.initialize();
        }
        /**
         * Returns a list of attributes corresponding to the registered properties.
         */
        static get observedAttributes() {
            // note: piggy backing on this to ensure we're _finalized.
            this._finalize();
            const attributes = [];
            for (const [p, v] of this._classProperties) {
                const attr = this._attributeNameForProperty(p, v);
                if (attr !== undefined) {
                    this._attributeToPropertyMap.set(attr, p);
                    attributes.push(attr);
                }
            }
            return attributes;
        }
        /**
         * Creates a property accessor on the element prototype if one does not exist.
         * The property setter calls the property's `hasChanged` property option
         * or uses a strict identity check to determine whether or not to request
         * an update.
         */
        static createProperty(name, options = defaultPropertyDeclaration) {
            // ensure private storage for property declarations.
            if (!this.hasOwnProperty('_classProperties')) {
                this._classProperties = new Map();
                // NOTE: Workaround IE11 not supporting Map constructor argument.
                const superProperties = Object.getPrototypeOf(this)._classProperties;
                if (superProperties !== undefined) {
                    superProperties.forEach((v, k) => this._classProperties.set(k, v));
                }
            }
            this._classProperties.set(name, options);
            // Allow user defined accessors by not replacing an existing own-property
            // accessor.
            if (this.prototype.hasOwnProperty(name)) {
                return;
            }
            const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
            Object.defineProperty(this.prototype, name, {
                get() { return this[key]; },
                set(value) {
                    const oldValue = this[name];
                    this[key] = value;
                    this._requestPropertyUpdate(name, oldValue, options);
                },
                configurable: true,
                enumerable: true
            });
        }
        /**
         * Creates property accessors for registered properties and ensures
         * any superclasses are also finalized.
         */
        static _finalize() {
            if (this.hasOwnProperty('_finalized') && this._finalized) {
                return;
            }
            // finalize any superclasses
            const superCtor = Object.getPrototypeOf(this);
            if (typeof superCtor._finalize === 'function') {
                superCtor._finalize();
            }
            this._finalized = true;
            // initialize Map populated in observedAttributes
            this._attributeToPropertyMap = new Map();
            // make any properties
            const props = this.properties;
            // support symbols in properties (IE11 does not support this)
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...(typeof Object.getOwnPropertySymbols === 'function')
                    ? Object.getOwnPropertySymbols(props)
                    : []
            ];
            for (const p of propKeys) {
                // note, use of `any` is due to TypeSript lack of support for symbol in
                // index types
                this.createProperty(p, props[p]);
            }
        }
        /**
         * Returns the property name for the given attribute `name`.
         */
        static _attributeNameForProperty(name, options) {
            const attribute = options !== undefined && options.attribute;
            return attribute === false
                ? undefined
                : (typeof attribute === 'string'
                    ? attribute
                    : (typeof name === 'string' ? name.toLowerCase()
                        : undefined));
        }
        /**
         * Returns true if a property should request an update.
         * Called when a property value is set and uses the `hasChanged`
         * option for the property if present or a strict identity check.
         */
        static _valueHasChanged(value, old, hasChanged = notEqual) {
            return hasChanged(value, old);
        }
        /**
         * Returns the property value for the given attribute value.
         * Called via the `attributeChangedCallback` and uses the property's `type`
         * or `type.fromAttribute` property option.
         */
        static _propertyValueFromAttribute(value, options) {
            const type = options && options.type;
            if (type === undefined) {
                return value;
            }
            // Note: special case `Boolean` so users can use it as a `type`.
            const fromAttribute = type === Boolean
                ? fromBooleanAttribute
                : (typeof type === 'function' ? type : type.fromAttribute);
            return fromAttribute ? fromAttribute(value) : value;
        }
        /**
         * Returns the attribute value for the given property value. If this
         * returns undefined, the property will *not* be reflected to an attribute.
         * If this returns null, the attribute will be removed, otherwise the
         * attribute will be set to the value.
         * This uses the property's `reflect` and `type.toAttribute` property options.
         */
        static _propertyValueToAttribute(value, options) {
            if (options === undefined || options.reflect === undefined) {
                return;
            }
            // Note: special case `Boolean` so users can use it as a `type`.
            const toAttribute = options.type === Boolean
                ? toBooleanAttribute
                : (options.type &&
                    options.type.toAttribute ||
                    String);
            return toAttribute(value);
        }
        /**
         * Performs element initialization. By default this calls `createRenderRoot`
         * to create the element `renderRoot` node and captures any pre-set values for
         * registered properties.
         */
        initialize() {
            this.renderRoot = this.createRenderRoot();
            this._saveInstanceProperties();
        }
        /**
         * Fixes any properties set on the instance before upgrade time.
         * Otherwise these would shadow the accessor and break these properties.
         * The properties are stored in a Map which is played back after the
         * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
         * (<=41), properties created for native platform properties like (`id` or
         * `name`) may not have default values set in the element constructor. On
         * these browsers native properties appear on instances and therefore their
         * default value will overwrite any element default (e.g. if the element sets
         * this.id = 'id' in the constructor, the 'id' will become '' since this is
         * the native platform default).
         */
        _saveInstanceProperties() {
            for (const [p] of this.constructor
                ._classProperties) {
                if (this.hasOwnProperty(p)) {
                    const value = this[p];
                    delete this[p];
                    if (!this._instanceProperties) {
                        this._instanceProperties = new Map();
                    }
                    this._instanceProperties.set(p, value);
                }
            }
        }
        /**
         * Applies previously saved instance properties.
         */
        _applyInstanceProperties() {
            for (const [p, v] of this._instanceProperties) {
                this[p] = v;
            }
            this._instanceProperties = undefined;
        }
        /**
         * Returns the node into which the element should render and by default
         * creates and returns an open shadowRoot. Implement to customize where the
         * element's DOM is rendered. For example, to render into the element's
         * childNodes, return `this`.
         * @returns {Element|DocumentFragment} Returns a node into which to render.
         */
        createRenderRoot() {
            return this.attachShadow({ mode: 'open' });
        }
        /**
         * Uses ShadyCSS to keep element DOM updated.
         */
        connectedCallback() {
            if ((this._updateState & STATE_HAS_UPDATED)) {
                if (window.ShadyCSS !== undefined) {
                    window.ShadyCSS.styleElement(this);
                }
            }
            else {
                this.requestUpdate();
            }
        }
        /**
         * Synchronizes property values when attributes change.
         */
        attributeChangedCallback(name, old, value) {
            if (old !== value) {
                this._attributeToProperty(name, value);
            }
        }
        _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
            const ctor = this.constructor;
            const attrValue = ctor._propertyValueToAttribute(value, options);
            if (attrValue !== undefined) {
                const attr = ctor._attributeNameForProperty(name, options);
                if (attr !== undefined) {
                    // Track if the property is being reflected to avoid
                    // setting the property again via `attributeChangedCallback`. Note:
                    // 1. this takes advantage of the fact that the callback is synchronous.
                    // 2. will behave incorrectly if multiple attributes are in the reaction
                    // stack at time of calling. However, since we process attributes
                    // in `update` this should not be possible (or an extreme corner case
                    // that we'd like to discover).
                    // mark state reflecting
                    this._updateState = this._updateState | STATE_IS_REFLECTING;
                    if (attrValue === null) {
                        this.removeAttribute(attr);
                    }
                    else {
                        this.setAttribute(attr, attrValue);
                    }
                    // mark state not reflecting
                    this._updateState = this._updateState & ~STATE_IS_REFLECTING;
                }
            }
        }
        _attributeToProperty(name, value) {
            // Use tracking info to avoid deserializing attribute value if it was
            // just set from a property setter.
            if (!(this._updateState & STATE_IS_REFLECTING)) {
                const ctor = this.constructor;
                const propName = ctor._attributeToPropertyMap.get(name);
                if (propName !== undefined) {
                    const options = ctor._classProperties.get(propName);
                    this[propName] =
                        ctor._propertyValueFromAttribute(value, options);
                }
            }
        }
        /**
         * Requests an update which is processed asynchronously. This should
         * be called when an element should update based on some state not triggered
         * by setting a property. In this case, pass no arguments. It should also be
         * called when manually implementing a property setter. In this case, pass the
         * property `name` and `oldValue` to ensure that any configured property
         * options are honored. Returns the `updateComplete` Promise which is resolved
         * when the update completes.
         *
         * @param name {PropertyKey} (optional) name of requesting property
         * @param oldValue {any} (optional) old value of requesting property
         * @returns {Promise} A Promise that is resolved when the update completes.
         */
        requestUpdate(name, oldValue) {
            if (name !== undefined) {
                const options = this.constructor
                    ._classProperties.get(name) ||
                    defaultPropertyDeclaration;
                return this._requestPropertyUpdate(name, oldValue, options);
            }
            return this._invalidate();
        }
        /**
         * Requests an update for a specific property and records change information.
         * @param name {PropertyKey} name of requesting property
         * @param oldValue {any} old value of requesting property
         * @param options {PropertyDeclaration}
         */
        _requestPropertyUpdate(name, oldValue, options) {
            if (!this.constructor
                ._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                return this.updateComplete;
            }
            // track old value when changing.
            if (!this._changedProperties.has(name)) {
                this._changedProperties.set(name, oldValue);
            }
            // add to reflecting properties set
            if (options.reflect === true) {
                if (this._reflectingProperties === undefined) {
                    this._reflectingProperties = new Map();
                }
                this._reflectingProperties.set(name, options);
            }
            return this._invalidate();
        }
        /**
         * Invalidates the element causing it to asynchronously update regardless
         * of whether or not any property changes are pending. This method is
         * automatically called when any registered property changes.
         */
        async _invalidate() {
            if (!this._hasRequestedUpdate) {
                // mark state updating...
                this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
                let resolver;
                const previousValidatePromise = this._updatePromise;
                this._updatePromise = new Promise((r) => resolver = r);
                await previousValidatePromise;
                this._validate();
                resolver(!this._hasRequestedUpdate);
            }
            return this.updateComplete;
        }
        get _hasRequestedUpdate() {
            return (this._updateState & STATE_UPDATE_REQUESTED);
        }
        /**
         * Validates the element by updating it.
         */
        _validate() {
            // Mixin instance properties once, if they exist.
            if (this._instanceProperties) {
                this._applyInstanceProperties();
            }
            if (this.shouldUpdate(this._changedProperties)) {
                const changedProperties = this._changedProperties;
                this.update(changedProperties);
                this._markUpdated();
                if (!(this._updateState & STATE_HAS_UPDATED)) {
                    this._updateState = this._updateState | STATE_HAS_UPDATED;
                    this.firstUpdated(changedProperties);
                }
                this.updated(changedProperties);
            }
            else {
                this._markUpdated();
            }
        }
        _markUpdated() {
            this._changedProperties = new Map();
            this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
        }
        /**
         * Returns a Promise that resolves when the element has completed updating.
         * The Promise value is a boolean that is `true` if the element completed the
         * update without triggering another update. The Promise result is `false` if
         * a property was set inside `updated()`. This getter can be implemented to
         * await additional state. For example, it is sometimes useful to await a
         * rendered element before fulfilling this Promise. To do this, first await
         * `super.updateComplete` then any subsequent state.
         *
         * @returns {Promise} The Promise returns a boolean that indicates if the
         * update resolved without triggering another update.
         */
        get updateComplete() { return this._updatePromise; }
        /**
         * Controls whether or not `update` should be called when the element requests
         * an update. By default, this method always returns `true`, but this can be
         * customized to control when to update.
         *
         * * @param _changedProperties Map of changed properties with old values
         */
        shouldUpdate(_changedProperties) {
            return true;
        }
        /**
         * Updates the element. This method reflects property values to attributes.
         * It can be overridden to render and keep updated DOM in the element's
         * `renderRoot`. Setting properties inside this method will *not* trigger
         * another update.
         *
         * * @param _changedProperties Map of changed properties with old values
         */
        update(_changedProperties) {
            if (this._reflectingProperties !== undefined &&
                this._reflectingProperties.size > 0) {
                for (const [k, v] of this._reflectingProperties) {
                    this._propertyToAttribute(k, this[k], v);
                }
                this._reflectingProperties = undefined;
            }
        }
        /**
         * Invoked whenever the element is updated. Implement to perform
         * post-updating tasks via DOM APIs, for example, focusing an element.
         *
         * Setting properties inside this method will trigger the element to update
         * again after this update cycle completes.
         *
         * * @param _changedProperties Map of changed properties with old values
         */
        updated(_changedProperties) { }
        /**
         * Invoked when the element is first updated. Implement to perform one time
         * work on the element after update.
         *
         * Setting properties inside this method will trigger the element to update
         * again after this update cycle completes.
         *
         * * @param _changedProperties Map of changed properties with old values
         */
        firstUpdated(_changedProperties) { }
    }
    /**
     * Maps attribute names to properties; for example `foobar` attribute
     * to `fooBar` property.
     */
    UpdatingElement._attributeToPropertyMap = new Map();
    /**
     * Marks class as having finished creating properties.
     */
    UpdatingElement._finalized = true;
    /**
     * Memoized list of all class properties, including any superclass properties.
     */
    UpdatingElement._classProperties = new Map();
    UpdatingElement.properties = {};

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */

    class LitElement extends UpdatingElement {
        /**
         * Updates the element. This method reflects property values to attributes
         * and calls `render` to render DOM via lit-html. Setting properties inside
         * this method will *not* trigger another update.
         * * @param _changedProperties Map of changed properties with old values
         */
        update(changedProperties) {
            super.update(changedProperties);
            if (typeof this.render === 'function') {
                this.constructor
                    .render(this.render(), this.renderRoot, this.localName);
            }
            else {
                throw new Error('render() not implemented');
            }
        }
    }
    /**
     * Render method used to render the lit-html TemplateResult to the element's
     * DOM.
     * @param {TemplateResult} Template to render.
     * @param {Element|DocumentFragment} Node into which to render.
     * @param {String} Element name.
     */
    LitElement.render = render$1;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    window.JSCompiler_renameProperty = function(prop) { return prop; };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let CSS_URL_RX = /(url\()([^)]*)(\))/g;
    let ABS_URL = /(^\/)|(^#)|(^[\w-\d]*:)/;
    let workingURL;
    let resolveDoc;
    /**
     * Resolves the given URL against the provided `baseUri'.
     *
     * Note that this function performs no resolution for URLs that start
     * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
     * URL resolution, use `window.URL`.
     *
     * @param {string} url Input URL to resolve
     * @param {?string=} baseURI Base URI to resolve the URL against
     * @return {string} resolved URL
     */
    function resolveUrl(url, baseURI) {
      if (url && ABS_URL.test(url)) {
        return url;
      }
      // Lazy feature detection.
      if (workingURL === undefined) {
        workingURL = false;
        try {
          const u = new URL('b', 'http://a');
          u.pathname = 'c%20d';
          workingURL = (u.href === 'http://a/c%20d');
        } catch (e) {
          // silently fail
        }
      }
      if (!baseURI) {
        baseURI = document.baseURI || window.location.href;
      }
      if (workingURL) {
        return (new URL(url, baseURI)).href;
      }
      // Fallback to creating an anchor into a disconnected document.
      if (!resolveDoc) {
        resolveDoc = document.implementation.createHTMLDocument('temp');
        resolveDoc.base = resolveDoc.createElement('base');
        resolveDoc.head.appendChild(resolveDoc.base);
        resolveDoc.anchor = resolveDoc.createElement('a');
        resolveDoc.body.appendChild(resolveDoc.anchor);
      }
      resolveDoc.base.href = baseURI;
      resolveDoc.anchor.href = url;
      return resolveDoc.anchor.href || url;

    }

    /**
     * Resolves any relative URL's in the given CSS text against the provided
     * `ownerDocument`'s `baseURI`.
     *
     * @param {string} cssText CSS text to process
     * @param {string} baseURI Base URI to resolve the URL against
     * @return {string} Processed CSS text with resolved URL's
     */
    function resolveCss(cssText, baseURI) {
      return cssText.replace(CSS_URL_RX, function(m, pre, url, post) {
        return pre + '\'' +
          resolveUrl(url.replace(/["']/g, ''), baseURI) +
          '\'' + post;
      });
    }

    /**
     * Returns a path from a given `url`. The path includes the trailing
     * `/` from the url.
     *
     * @param {string} url Input URL to transform
     * @return {string} resolved path
     */
    function pathFromUrl(url) {
      return url.substring(0, url.lastIndexOf('/') + 1);
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */
    const useShadow = !(window.ShadyDOM);
    const useNativeCSSProperties = Boolean(!window.ShadyCSS || window.ShadyCSS.nativeCss);
    const useNativeCustomElements = !(window.customElements.polyfillWrapFlushCallback);


    /**
     * Globally settable property that is automatically assigned to
     * `ElementMixin` instances, useful for binding in templates to
     * make URL's relative to an application's root.  Defaults to the main
     * document URL, but can be overridden by users.  It may be useful to set
     * `rootPath` to provide a stable application mount path when
     * using client side routing.
     */
    let rootPath = undefined ||
      pathFromUrl(document.baseURI || window.location.href);

    /**
     * A global callback used to sanitize any value before inserting it into the DOM. The callback signature is:
     *
     *     Polymer = {
     *       sanitizeDOMValue: function(value, name, type, node) { ... }
     *     }
     *
     * Where:
     *
     * `value` is the value to sanitize.
     * `name` is the name of an attribute or property (for example, href).
     * `type` indicates where the value is being inserted: one of property, attribute, or text.
     * `node` is the node where the value is being inserted.
     *
     * @type {(function(*,string,string,Node):*)|undefined}
     */
    let sanitizeDOMValue = undefined;

    /**
     * Globally settable property to make Polymer Gestures use passive TouchEvent listeners when recognizing gestures.
     * When set to `true`, gestures made from touch will not be able to prevent scrolling, allowing for smoother
     * scrolling performance.
     * Defaults to `false` for backwards compatibility.
     */
    let passiveTouchGestures = false;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // unique global id for deduping mixins.
    let dedupeId = 0;

    /* eslint-disable valid-jsdoc */
    /**
     * Wraps an ES6 class expression mixin such that the mixin is only applied
     * if it has not already been applied its base argument. Also memoizes mixin
     * applications.
     *
     * @template T
     * @param {T} mixin ES6 class expression mixin to wrap
     * @return {T}
     * @suppress {invalidCasts}
     */
    const dedupingMixin = function(mixin) {
      let mixinApplications = /** @type {!MixinFunction} */(mixin).__mixinApplications;
      if (!mixinApplications) {
        mixinApplications = new WeakMap();
        /** @type {!MixinFunction} */(mixin).__mixinApplications = mixinApplications;
      }
      // maintain a unique id for each mixin
      let mixinDedupeId = dedupeId++;
      function dedupingMixin(base) {
        let baseSet = /** @type {!MixinFunction} */(base).__mixinSet;
        if (baseSet && baseSet[mixinDedupeId]) {
          return base;
        }
        let map = mixinApplications;
        let extended = map.get(base);
        if (!extended) {
          extended = /** @type {!Function} */(mixin)(base);
          map.set(base, extended);
        }
        // copy inherited mixin set from the extended class, or the base class
        // NOTE: we avoid use of Set here because some browser (IE11)
        // cannot extend a base Set via the constructor.
        let mixinSet = Object.create(/** @type {!MixinFunction} */(extended).__mixinSet || baseSet || null);
        mixinSet[mixinDedupeId] = true;
        /** @type {!MixinFunction} */(extended).__mixinSet = mixinSet;
        return extended;
      }

      return dedupingMixin;
    };
    /* eslint-enable valid-jsdoc */

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const MODULE_STYLE_LINK_SELECTOR = 'link[rel=import][type~=css]';
    const INCLUDE_ATTR = 'include';
    const SHADY_UNSCOPED_ATTR = 'shady-unscoped';

    function importModule(moduleId) {
      const /** DomModule */ PolymerDomModule = customElements.get('dom-module');
      if (!PolymerDomModule) {
        return null;
      }
      return PolymerDomModule.import(moduleId);
    }

    function styleForImport(importDoc) {
      // NOTE: polyfill affordance.
      // under the HTMLImports polyfill, there will be no 'body',
      // but the import pseudo-doc can be used directly.
      let container = importDoc.body ? importDoc.body : importDoc;
      const importCss = resolveCss(container.textContent,
        importDoc.baseURI);
      const style = document.createElement('style');
      style.textContent = importCss;
      return style;
    }

    /**
     * Returns a list of <style> elements in a space-separated list of `dom-module`s.
     *
     * @function
     * @param {string} moduleIds List of dom-module id's within which to
     * search for css.
     * @return {!Array<!HTMLStyleElement>} Array of contained <style> elements
     * @this {StyleGather}
     */
    function stylesFromModules(moduleIds) {
     const modules = moduleIds.trim().split(/\s+/);
     const styles = [];
     for (let i=0; i < modules.length; i++) {
       styles.push(...stylesFromModule(modules[i]));
     }
     return styles;
    }

    /**
     * Returns a list of <style> elements in a given `dom-module`.
     * Styles in a `dom-module` can come either from `<style>`s within the
     * first `<template>`, or else from one or more
     * `<link rel="import" type="css">` links outside the template.
     *
     * @param {string} moduleId dom-module id to gather styles from
     * @return {!Array<!HTMLStyleElement>} Array of contained styles.
     * @this {StyleGather}
     */
    function stylesFromModule(moduleId) {
      const m = importModule(moduleId);

      if (!m) {
        console.warn('Could not find style data in module named', moduleId);
        return [];
      }

      if (m._styles === undefined) {
        const styles = [];
        // module imports: <link rel="import" type="css">
        styles.push(..._stylesFromModuleImports(m));
        // include css from the first template in the module
        const template = m.querySelector('template');
        if (template) {
          styles.push(...stylesFromTemplate(template,
            /** @type {templateWithAssetPath} */(m).assetpath));
        }

        m._styles = styles;
      }

      return m._styles;
    }

    /**
     * Returns the `<style>` elements within a given template.
     *
     * @param {!HTMLTemplateElement} template Template to gather styles from
     * @param {string} baseURI baseURI for style content
     * @return {!Array<!HTMLStyleElement>} Array of styles
     * @this {StyleGather}
     */
    function stylesFromTemplate(template, baseURI) {
      if (!template._styles) {
        const styles = [];
        // if element is a template, get content from its .content
        const e$ = template.content.querySelectorAll('style');
        for (let i=0; i < e$.length; i++) {
          let e = e$[i];
          // support style sharing by allowing styles to "include"
          // other dom-modules that contain styling
          let include = e.getAttribute(INCLUDE_ATTR);
          if (include) {
            styles.push(...stylesFromModules(include).filter(function(item, index, self) {
              return self.indexOf(item) === index;
            }));
          }
          if (baseURI) {
            e.textContent = resolveCss(e.textContent, baseURI);
          }
          styles.push(e);
        }
        template._styles = styles;
      }
      return template._styles;
    }

    /**
     * Returns a list of <style> elements  from stylesheets loaded via `<link rel="import" type="css">` links within the specified `dom-module`.
     *
     * @param {string} moduleId Id of `dom-module` to gather CSS from
     * @return {!Array<!HTMLStyleElement>} Array of contained styles.
     * @this {StyleGather}
     */
    function stylesFromModuleImports(moduleId) {
     let m = importModule(moduleId);
     return m ? _stylesFromModuleImports(m) : [];
    }

    /**
     * @this {StyleGather}
     * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
     * @return {!Array<!HTMLStyleElement>} Array of contained styles
     */
    function _stylesFromModuleImports(module) {
      const styles = [];
      const p$ = module.querySelectorAll(MODULE_STYLE_LINK_SELECTOR);
      for (let i=0; i < p$.length; i++) {
        let p = p$[i];
        if (p.import) {
          const importDoc = p.import;
          const unscoped = p.hasAttribute(SHADY_UNSCOPED_ATTR);
          if (unscoped && !importDoc._unscopedStyle) {
            const style = styleForImport(importDoc);
            style.setAttribute(SHADY_UNSCOPED_ATTR, '');
            importDoc._unscopedStyle = style;
          } else if (!importDoc._style) {
            importDoc._style = styleForImport(importDoc);
          }
          styles.push(unscoped ? importDoc._unscopedStyle : importDoc._style);
        }
      }
      return styles;
    }

    /**
     *
     * Returns CSS text of styles in a space-separated list of `dom-module`s.
     * Note: This method is deprecated, use `stylesFromModules` instead.
     *
     * @deprecated
     * @param {string} moduleIds List of dom-module id's within which to
     * search for css.
     * @return {string} Concatenated CSS content from specified `dom-module`s
     * @this {StyleGather}
     */
    function cssFromModules(moduleIds) {
     let modules = moduleIds.trim().split(/\s+/);
     let cssText = '';
     for (let i=0; i < modules.length; i++) {
       cssText += cssFromModule(modules[i]);
     }
     return cssText;
    }

    /**
     * Returns CSS text of styles in a given `dom-module`.  CSS in a `dom-module`
     * can come either from `<style>`s within the first `<template>`, or else
     * from one or more `<link rel="import" type="css">` links outside the
     * template.
     *
     * Any `<styles>` processed are removed from their original location.
     * Note: This method is deprecated, use `styleFromModule` instead.
     *
     * @deprecated
     * @param {string} moduleId dom-module id to gather styles from
     * @return {string} Concatenated CSS content from specified `dom-module`
     * @this {StyleGather}
     */
    function cssFromModule(moduleId) {
      let m = importModule(moduleId);
      if (m && m._cssText === undefined) {
        // module imports: <link rel="import" type="css">
        let cssText = _cssFromModuleImports(m);
        // include css from the first template in the module
        let t = m.querySelector('template');
        if (t) {
          cssText += cssFromTemplate(t,
            /** @type {templateWithAssetPath} */(m).assetpath);
        }
        m._cssText = cssText || null;
      }
      if (!m) {
        console.warn('Could not find style data in module named', moduleId);
      }
      return m && m._cssText || '';
    }

    /**
     * Returns CSS text of `<styles>` within a given template.
     *
     * Any `<styles>` processed are removed from their original location.
     * Note: This method is deprecated, use `styleFromTemplate` instead.
     *
     * @deprecated
     * @param {!HTMLTemplateElement} template Template to gather styles from
     * @param {string} baseURI Base URI to resolve the URL against
     * @return {string} Concatenated CSS content from specified template
     * @this {StyleGather}
     */
    function cssFromTemplate(template, baseURI) {
      let cssText = '';
      const e$ = stylesFromTemplate(template, baseURI);
      // if element is a template, get content from its .content
      for (let i=0; i < e$.length; i++) {
        let e = e$[i];
        if (e.parentNode) {
          e.parentNode.removeChild(e);
        }
        cssText += e.textContent;
      }
      return cssText;
    }

    /**
     * @deprecated
     * @this {StyleGather}
     * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
     * @return {string} Concatenated CSS content from links in the dom-module
     */
    function _cssFromModuleImports(module) {
     let cssText = '';
     let styles = _stylesFromModuleImports(module);
     for (let i=0; i < styles.length; i++) {
       cssText += styles[i].textContent;
     }
     return cssText;
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let modules = {};
    let lcModules = {};
    function findModule(id) {
      return modules[id] || lcModules[id.toLowerCase()];
    }

    function styleOutsideTemplateCheck(inst) {
      if (inst.querySelector('style')) {
        console.warn('dom-module %s has style outside template', inst.id);
      }
    }

    /**
     * The `dom-module` element registers the dom it contains to the name given
     * by the module's id attribute. It provides a unified database of dom
     * accessible via its static `import` API.
     *
     * A key use case of `dom-module` is for providing custom element `<template>`s
     * via HTML imports that are parsed by the native HTML parser, that can be
     * relocated during a bundling pass and still looked up by `id`.
     *
     * Example:
     *
     *     <dom-module id="foo">
     *       <img src="stuff.png">
     *     </dom-module>
     *
     * Then in code in some other location that cannot access the dom-module above
     *
     *     let img = customElements.get('dom-module').import('foo', 'img');
     *
     * @customElement
     * @extends HTMLElement
     * @summary Custom element that provides a registry of relocatable DOM content
     *   by `id` that is agnostic to bundling.
     * @unrestricted
     */
    class DomModule extends HTMLElement {

      static get observedAttributes() { return ['id']; }

      /**
       * Retrieves the element specified by the css `selector` in the module
       * registered by `id`. For example, this.import('foo', 'img');
       * @param {string} id The id of the dom-module in which to search.
       * @param {string=} selector The css selector by which to find the element.
       * @return {Element} Returns the element which matches `selector` in the
       * module registered at the specified `id`.
       */
      static import(id, selector) {
        if (id) {
          let m = findModule(id);
          if (m && selector) {
            return m.querySelector(selector);
          }
          return m;
        }
        return null;
      }

      /* eslint-disable no-unused-vars */
      /**
       * @param {string} name Name of attribute.
       * @param {?string} old Old value of attribute.
       * @param {?string} value Current value of attribute.
       * @param {?string} namespace Attribute namespace.
       * @return {void}
       * @override
       */
      attributeChangedCallback(name, old, value, namespace) {
        if (old !== value) {
          this.register();
        }
      }
      /* eslint-enable no-unused-args */

      /**
       * The absolute URL of the original location of this `dom-module`.
       *
       * This value will differ from this element's `ownerDocument` in the
       * following ways:
       * - Takes into account any `assetpath` attribute added during bundling
       *   to indicate the original location relative to the bundled location
       * - Uses the HTMLImports polyfill's `importForElement` API to ensure
       *   the path is relative to the import document's location since
       *   `ownerDocument` is not currently polyfilled
       */
      get assetpath() {
        // Don't override existing assetpath.
        if (!this.__assetpath) {
          // note: assetpath set via an attribute must be relative to this
          // element's location; accomodate polyfilled HTMLImports
          const owner = window.HTMLImports && HTMLImports.importForElement ?
            HTMLImports.importForElement(this) || document : this.ownerDocument;
          const url = resolveUrl(
            this.getAttribute('assetpath') || '', owner.baseURI);
          this.__assetpath = pathFromUrl(url);
        }
        return this.__assetpath;
      }

      /**
       * Registers the dom-module at a given id. This method should only be called
       * when a dom-module is imperatively created. For
       * example, `document.createElement('dom-module').register('foo')`.
       * @param {string=} id The id at which to register the dom-module.
       * @return {void}
       */
      register(id) {
        id = id || this.id;
        if (id) {
          this.id = id;
          // store id separate from lowercased id so that
          // in all cases mixedCase id will stored distinctly
          // and lowercase version is a fallback
          modules[id] = this;
          lcModules[id.toLowerCase()] = this;
          styleOutsideTemplateCheck(this);
        }
      }
    }

    DomModule.prototype['modules'] = modules;

    customElements.define('dom-module', DomModule);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Returns true if the given string is a structured data path (has dots).
     *
     * Example:
     *
     * ```
     * isPath('foo.bar.baz') // true
     * isPath('foo')         // false
     * ```
     *
     * @param {string} path Path string
     * @return {boolean} True if the string contained one or more dots
     */
    function isPath(path) {
      return path.indexOf('.') >= 0;
    }

    /**
     * Returns the root property name for the given path.
     *
     * Example:
     *
     * ```
     * root('foo.bar.baz') // 'foo'
     * root('foo')         // 'foo'
     * ```
     *
     * @param {string} path Path string
     * @return {string} Root property name
     */
    function root(path) {
      let dotIndex = path.indexOf('.');
      if (dotIndex === -1) {
        return path;
      }
      return path.slice(0, dotIndex);
    }

    /**
     * Given `base` is `foo.bar`, `foo` is an ancestor, `foo.bar` is not
     * Returns true if the given path is an ancestor of the base path.
     *
     * Example:
     *
     * ```
     * isAncestor('foo.bar', 'foo')         // true
     * isAncestor('foo.bar', 'foo.bar')     // false
     * isAncestor('foo.bar', 'foo.bar.baz') // false
     * ```
     *
     * @param {string} base Path string to test against.
     * @param {string} path Path string to test.
     * @return {boolean} True if `path` is an ancestor of `base`.
     */
    function isAncestor(base, path) {
      //     base.startsWith(path + '.');
      return base.indexOf(path + '.') === 0;
    }

    /**
     * Given `base` is `foo.bar`, `foo.bar.baz` is an descendant
     *
     * Example:
     *
     * ```
     * isDescendant('foo.bar', 'foo.bar.baz') // true
     * isDescendant('foo.bar', 'foo.bar')     // false
     * isDescendant('foo.bar', 'foo')         // false
     * ```
     *
     * @param {string} base Path string to test against.
     * @param {string} path Path string to test.
     * @return {boolean} True if `path` is a descendant of `base`.
     */
    function isDescendant(base, path) {
      //     path.startsWith(base + '.');
      return path.indexOf(base + '.') === 0;
    }

    /**
     * Replaces a previous base path with a new base path, preserving the
     * remainder of the path.
     *
     * User must ensure `path` has a prefix of `base`.
     *
     * Example:
     *
     * ```
     * translate('foo.bar', 'zot', 'foo.bar.baz') // 'zot.baz'
     * ```
     *
     * @param {string} base Current base string to remove
     * @param {string} newBase New base string to replace with
     * @param {string} path Path to translate
     * @return {string} Translated string
     */
    function translate(base, newBase, path) {
      return newBase + path.slice(base.length);
    }

    /**
     * @param {string} base Path string to test against
     * @param {string} path Path string to test
     * @return {boolean} True if `path` is equal to `base`
     * @this {Path}
     */
    function matches(base, path) {
      return (base === path) ||
             isAncestor(base, path) ||
             isDescendant(base, path);
    }

    /**
     * Converts array-based paths to flattened path.  String-based paths
     * are returned as-is.
     *
     * Example:
     *
     * ```
     * normalize(['foo.bar', 0, 'baz'])  // 'foo.bar.0.baz'
     * normalize('foo.bar.0.baz')        // 'foo.bar.0.baz'
     * ```
     *
     * @param {string | !Array<string|number>} path Input path
     * @return {string} Flattened path
     */
    function normalize(path) {
      if (Array.isArray(path)) {
        let parts = [];
        for (let i=0; i<path.length; i++) {
          let args = path[i].toString().split('.');
          for (let j=0; j<args.length; j++) {
            parts.push(args[j]);
          }
        }
        return parts.join('.');
      } else {
        return path;
      }
    }

    /**
     * Splits a path into an array of property names. Accepts either arrays
     * of path parts or strings.
     *
     * Example:
     *
     * ```
     * split(['foo.bar', 0, 'baz'])  // ['foo', 'bar', '0', 'baz']
     * split('foo.bar.0.baz')        // ['foo', 'bar', '0', 'baz']
     * ```
     *
     * @param {string | !Array<string|number>} path Input path
     * @return {!Array<string>} Array of path parts
     * @this {Path}
     * @suppress {checkTypes}
     */
    function split(path) {
      if (Array.isArray(path)) {
        return normalize(path).split('.');
      }
      return path.toString().split('.');
    }

    /**
     * Reads a value from a path.  If any sub-property in the path is `undefined`,
     * this method returns `undefined` (will never throw.
     *
     * @param {Object} root Object from which to dereference path from
     * @param {string | !Array<string|number>} path Path to read
     * @param {Object=} info If an object is provided to `info`, the normalized
     *  (flattened) path will be set to `info.path`.
     * @return {*} Value at path, or `undefined` if the path could not be
     *  fully dereferenced.
     * @this {Path}
     */
    function get(root, path, info) {
      let prop = root;
      let parts = split(path);
      // Loop over path parts[0..n-1] and dereference
      for (let i=0; i<parts.length; i++) {
        if (!prop) {
          return;
        }
        let part = parts[i];
        prop = prop[part];
      }
      if (info) {
        info.path = parts.join('.');
      }
      return prop;
    }

    /**
     * Sets a value to a path.  If any sub-property in the path is `undefined`,
     * this method will no-op.
     *
     * @param {Object} root Object from which to dereference path from
     * @param {string | !Array<string|number>} path Path to set
     * @param {*} value Value to set to path
     * @return {string | undefined} The normalized version of the input path
     * @this {Path}
     */
    function set(root, path, value) {
      let prop = root;
      let parts = split(path);
      let last = parts[parts.length-1];
      if (parts.length > 1) {
        // Loop over path parts[0..n-2] and dereference
        for (let i=0; i<parts.length-1; i++) {
          let part = parts[i];
          prop = prop[part];
          if (!prop) {
            return;
          }
        }
        // Set value to object at end of path
        prop[last] = value;
      } else {
        // Simple property set
        prop[path] = value;
      }
      return parts.join('.');
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const caseMap = {};
    const DASH_TO_CAMEL = /-[a-z]/g;
    const CAMEL_TO_DASH = /([A-Z])/g;

    /**
     * @fileoverview Module with utilities for converting between "dash-case" and
     * "camelCase" identifiers.
     */

    /**
     * Converts "dash-case" identifier (e.g. `foo-bar-baz`) to "camelCase"
     * (e.g. `fooBarBaz`).
     *
     * @param {string} dash Dash-case identifier
     * @return {string} Camel-case representation of the identifier
     */
    function dashToCamelCase(dash) {
      return caseMap[dash] || (
        caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(DASH_TO_CAMEL,
          (m) => m[1].toUpperCase()
        )
      );
    }

    /**
     * Converts "camelCase" identifier (e.g. `fooBarBaz`) to "dash-case"
     * (e.g. `foo-bar-baz`).
     *
     * @param {string} camel Camel-case identifier
     * @return {string} Dash-case representation of the identifier
     */
    function camelToDashCase(camel) {
      return caseMap[camel] || (
        caseMap[camel] = camel.replace(CAMEL_TO_DASH, '-$1').toLowerCase()
      );
    }

    var caseMap$0 = /*#__PURE__*/Object.freeze({
        dashToCamelCase: dashToCamelCase,
        camelToDashCase: camelToDashCase
    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // Microtask implemented using Mutation Observer
    let microtaskCurrHandle = 0;
    let microtaskLastHandle = 0;
    let microtaskCallbacks = [];
    let microtaskNodeContent = 0;
    let microtaskNode = document.createTextNode('');
    new window.MutationObserver(microtaskFlush).observe(microtaskNode, {characterData: true});

    function microtaskFlush() {
      const len = microtaskCallbacks.length;
      for (let i = 0; i < len; i++) {
        let cb = microtaskCallbacks[i];
        if (cb) {
          try {
            cb();
          } catch (e) {
            setTimeout(() => { throw e; });
          }
        }
      }
      microtaskCallbacks.splice(0, len);
      microtaskLastHandle += len;
    }

    /**
     * Async interface wrapper around `setTimeout`.
     *
     * @namespace
     * @summary Async interface wrapper around `setTimeout`.
     */
    const timeOut = {
      /**
       * Returns a sub-module with the async interface providing the provided
       * delay.
       *
       * @memberof timeOut
       * @param {number=} delay Time to wait before calling callbacks in ms
       * @return {!AsyncInterface} An async timeout interface
       */
      after(delay) {
        return {
          run(fn) { return window.setTimeout(fn, delay); },
          cancel(handle) {
            window.clearTimeout(handle);
          }
        };
      },
      /**
       * Enqueues a function called in the next task.
       *
       * @memberof timeOut
       * @param {!Function} fn Callback to run
       * @param {number=} delay Delay in milliseconds
       * @return {number} Handle used for canceling task
       */
      run(fn, delay) {
        return window.setTimeout(fn, delay);
      },
      /**
       * Cancels a previously enqueued `timeOut` callback.
       *
       * @memberof timeOut
       * @param {number} handle Handle returned from `run` of callback to cancel
       * @return {void}
       */
      cancel(handle) {
        window.clearTimeout(handle);
      }
    };

    /**
     * Async interface wrapper around `requestIdleCallback`.  Falls back to
     * `setTimeout` on browsers that do not support `requestIdleCallback`.
     *
     * @namespace
     * @summary Async interface wrapper around `requestIdleCallback`.
     */
    const idlePeriod = {
      /**
       * Enqueues a function called at `requestIdleCallback` timing.
       *
       * @memberof idlePeriod
       * @param {function(!IdleDeadline):void} fn Callback to run
       * @return {number} Handle used for canceling task
       */
      run(fn) {
        return window.requestIdleCallback ?
          window.requestIdleCallback(fn) :
          window.setTimeout(fn, 16);
      },
      /**
       * Cancels a previously enqueued `idlePeriod` callback.
       *
       * @memberof idlePeriod
       * @param {number} handle Handle returned from `run` of callback to cancel
       * @return {void}
       */
      cancel(handle) {
        window.cancelIdleCallback ?
          window.cancelIdleCallback(handle) :
          window.clearTimeout(handle);
      }
    };

    /**
     * Async interface for enqueuing callbacks that run at microtask timing.
     *
     * Note that microtask timing is achieved via a single `MutationObserver`,
     * and thus callbacks enqueued with this API will all run in a single
     * batch, and not interleaved with other microtasks such as promises.
     * Promises are avoided as an implementation choice for the time being
     * due to Safari bugs that cause Promises to lack microtask guarantees.
     *
     * @namespace
     * @summary Async interface for enqueuing callbacks that run at microtask
     *   timing.
     */
    const microTask = {

      /**
       * Enqueues a function called at microtask timing.
       *
       * @memberof microTask
       * @param {!Function=} callback Callback to run
       * @return {number} Handle used for canceling task
       */
      run(callback) {
        microtaskNode.textContent = microtaskNodeContent++;
        microtaskCallbacks.push(callback);
        return microtaskCurrHandle++;
      },

      /**
       * Cancels a previously enqueued `microTask` callback.
       *
       * @memberof microTask
       * @param {number} handle Handle returned from `run` of callback to cancel
       * @return {void}
       */
      cancel(handle) {
        const idx = handle - microtaskLastHandle;
        if (idx >= 0) {
          if (!microtaskCallbacks[idx]) {
            throw new Error('invalid async handle: ' + handle);
          }
          microtaskCallbacks[idx] = null;
        }
      }

    };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /** @const {!AsyncInterface} */
    const microtask = microTask;

    /**
     * Element class mixin that provides basic meta-programming for creating one
     * or more property accessors (getter/setter pair) that enqueue an async
     * (batched) `_propertiesChanged` callback.
     *
     * For basic usage of this mixin, call `MyClass.createProperties(props)`
     * once at class definition time to create property accessors for properties
     * named in props, implement `_propertiesChanged` to react as desired to
     * property changes, and implement `static get observedAttributes()` and
     * include lowercase versions of any property names that should be set from
     * attributes. Last, call `this._enableProperties()` in the element's
     * `connectedCallback` to enable the accessors.
     *
     * @mixinFunction
     * @polymer
     * @summary Element class mixin for reacting to property changes from
     *   generated property accessors.
     */
    const PropertiesChanged = dedupingMixin(
        /**
         * @template T
         * @param {function(new:T)} superClass Class to apply mixin to.
         * @return {function(new:T)} superClass with mixin applied.
         */
        (superClass) => {

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_PropertiesChanged}
       * @unrestricted
       */
      class PropertiesChanged extends superClass {

        /**
         * Creates property accessors for the given property names.
         * @param {!Object} props Object whose keys are names of accessors.
         * @return {void}
         * @protected
         */
        static createProperties(props) {
          const proto = this.prototype;
          for (let prop in props) {
            // don't stomp an existing accessor
            if (!(prop in proto)) {
              proto._createPropertyAccessor(prop);
            }
          }
        }

        /**
         * Returns an attribute name that corresponds to the given property.
         * The attribute name is the lowercased property name. Override to
         * customize this mapping.
         * @param {string} property Property to convert
         * @return {string} Attribute name corresponding to the given property.
         *
         * @protected
         */
        static attributeNameForProperty(property) {
          return property.toLowerCase();
        }

        /**
         * Override point to provide a type to which to deserialize a value to
         * a given property.
         * @param {string} name Name of property
         *
         * @protected
         */
        static typeForProperty(name) { } //eslint-disable-line no-unused-vars

        /**
         * Creates a setter/getter pair for the named property with its own
         * local storage.  The getter returns the value in the local storage,
         * and the setter calls `_setProperty`, which updates the local storage
         * for the property and enqueues a `_propertiesChanged` callback.
         *
         * This method may be called on a prototype or an instance.  Calling
         * this method may overwrite a property value that already exists on
         * the prototype/instance by creating the accessor.
         *
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created; the
         *   protected `_setProperty` function must be used to set the property
         * @return {void}
         * @protected
         * @override
         */
        _createPropertyAccessor(property, readOnly) {
          this._addPropertyToAttributeMap(property);
          if (!this.hasOwnProperty('__dataHasAccessor')) {
            this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
          }
          if (!this.__dataHasAccessor[property]) {
            this.__dataHasAccessor[property] = true;
            this._definePropertyAccessor(property, readOnly);
          }
        }

        /**
         * Adds the given `property` to a map matching attribute names
         * to property names, using `attributeNameForProperty`. This map is
         * used when deserializing attribute values to properties.
         *
         * @param {string} property Name of the property
         * @override
         */
        _addPropertyToAttributeMap(property) {
          if (!this.hasOwnProperty('__dataAttributes')) {
            this.__dataAttributes = Object.assign({}, this.__dataAttributes);
          }
          if (!this.__dataAttributes[property]) {
            const attr = this.constructor.attributeNameForProperty(property);
            this.__dataAttributes[attr] = property;
          }
        }

        /**
         * Defines a property accessor for the given property.
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created
         * @return {void}
         * @override
         */
         _definePropertyAccessor(property, readOnly) {
          Object.defineProperty(this, property, {
            /* eslint-disable valid-jsdoc */
            /** @this {PropertiesChanged} */
            get() {
              return this._getProperty(property);
            },
            /** @this {PropertiesChanged} */
            set: readOnly ? function () {} : function (value) {
              this._setProperty(property, value);
            }
            /* eslint-enable */
          });
        }

        constructor() {
          super();
          this.__dataEnabled = false;
          this.__dataReady = false;
          this.__dataInvalid = false;
          this.__data = {};
          this.__dataPending = null;
          this.__dataOld = null;
          this.__dataInstanceProps = null;
          this.__serializing = false;
          this._initializeProperties();
        }

        /**
         * Lifecycle callback called when properties are enabled via
         * `_enableProperties`.
         *
         * Users may override this function to implement behavior that is
         * dependent on the element having its property data initialized, e.g.
         * from defaults (initialized from `constructor`, `_initializeProperties`),
         * `attributeChangedCallback`, or values propagated from host e.g. via
         * bindings.  `super.ready()` must be called to ensure the data system
         * becomes enabled.
         *
         * @return {void}
         * @public
         * @override
         */
        ready() {
          this.__dataReady = true;
          this._flushProperties();
        }

        /**
         * Initializes the local storage for property accessors.
         *
         * Provided as an override point for performing any setup work prior
         * to initializing the property accessor system.
         *
         * @return {void}
         * @protected
         * @override
         */
        _initializeProperties() {
          // Capture instance properties; these will be set into accessors
          // during first flush. Don't set them here, since we want
          // these to overwrite defaults/constructor assignments
          for (let p in this.__dataHasAccessor) {
            if (this.hasOwnProperty(p)) {
              this.__dataInstanceProps = this.__dataInstanceProps || {};
              this.__dataInstanceProps[p] = this[p];
              delete this[p];
            }
          }
        }

        /**
         * Called at ready time with bag of instance properties that overwrote
         * accessors when the element upgraded.
         *
         * The default implementation sets these properties back into the
         * setter at ready time.  This method is provided as an override
         * point for customizing or providing more efficient initialization.
         *
         * @param {Object} props Bag of property values that were overwritten
         *   when creating property accessors.
         * @return {void}
         * @protected
         * @override
         */
        _initializeInstanceProperties(props) {
          Object.assign(this, props);
        }

        /**
         * Updates the local storage for a property (via `_setPendingProperty`)
         * and enqueues a `_proeprtiesChanged` callback.
         *
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @return {void}
         * @protected
         * @override
         */
        _setProperty(property, value) {
          if (this._setPendingProperty(property, value)) {
            this._invalidateProperties();
          }
        }

        /**
         * Returns the value for the given property.
         * @param {string} property Name of property
         * @return {*} Value for the given property
         * @protected
         * @override
         */
        _getProperty(property) {
          return this.__data[property];
        }

        /* eslint-disable no-unused-vars */
        /**
         * Updates the local storage for a property, records the previous value,
         * and adds it to the set of "pending changes" that will be passed to the
         * `_propertiesChanged` callback.  This method does not enqueue the
         * `_propertiesChanged` callback.
         *
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @param {boolean=} ext Not used here; affordance for closure
         * @return {boolean} Returns true if the property changed
         * @protected
         * @override
         */
        _setPendingProperty(property, value, ext) {
          let old = this.__data[property];
          let changed = this._shouldPropertyChange(property, value, old);
          if (changed) {
            if (!this.__dataPending) {
              this.__dataPending = {};
              this.__dataOld = {};
            }
            // Ensure old is captured from the last turn
            if (this.__dataOld && !(property in this.__dataOld)) {
              this.__dataOld[property] = old;
            }
            this.__data[property] = value;
            this.__dataPending[property] = value;
          }
          return changed;
        }
        /* eslint-enable */

        /**
         * Marks the properties as invalid, and enqueues an async
         * `_propertiesChanged` callback.
         *
         * @return {void}
         * @protected
         * @override
         */
        _invalidateProperties() {
          if (!this.__dataInvalid && this.__dataReady) {
            this.__dataInvalid = true;
            microtask.run(() => {
              if (this.__dataInvalid) {
                this.__dataInvalid = false;
                this._flushProperties();
              }
            });
          }
        }

        /**
         * Call to enable property accessor processing. Before this method is
         * called accessor values will be set but side effects are
         * queued. When called, any pending side effects occur immediately.
         * For elements, generally `connectedCallback` is a normal spot to do so.
         * It is safe to call this method multiple times as it only turns on
         * property accessors once.
         *
         * @return {void}
         * @protected
         * @override
         */
        _enableProperties() {
          if (!this.__dataEnabled) {
            this.__dataEnabled = true;
            if (this.__dataInstanceProps) {
              this._initializeInstanceProperties(this.__dataInstanceProps);
              this.__dataInstanceProps = null;
            }
            this.ready();
          }
        }

        /**
         * Calls the `_propertiesChanged` callback with the current set of
         * pending changes (and old values recorded when pending changes were
         * set), and resets the pending set of changes. Generally, this method
         * should not be called in user code.
         *
         * @return {void}
         * @protected
         * @override
         */
        _flushProperties() {
          const props = this.__data;
          const changedProps = this.__dataPending;
          const old = this.__dataOld;
          if (this._shouldPropertiesChange(props, changedProps, old)) {
            this.__dataPending = null;
            this.__dataOld = null;
            this._propertiesChanged(props, changedProps, old);
          }
        }

        /**
         * Called in `_flushProperties` to determine if `_propertiesChanged`
         * should be called. The default implementation returns true if
         * properties are pending. Override to customize when
         * `_propertiesChanged` is called.
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {?Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {?Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {boolean} true if changedProps is truthy
         * @override
         */
        _shouldPropertiesChange(currentProps, changedProps, oldProps) { // eslint-disable-line no-unused-vars
          return Boolean(changedProps);
        }

        /**
         * Callback called when any properties with accessors created via
         * `_createPropertyAccessor` have been set.
         *
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {?Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {?Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {void}
         * @protected
         * @override
         */
        _propertiesChanged(currentProps, changedProps, oldProps) { // eslint-disable-line no-unused-vars
        }

        /**
         * Method called to determine whether a property value should be
         * considered as a change and cause the `_propertiesChanged` callback
         * to be enqueued.
         *
         * The default implementation returns `true` if a strict equality
         * check fails. The method always returns false for `NaN`.
         *
         * Override this method to e.g. provide stricter checking for
         * Objects/Arrays when using immutable patterns.
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         *   and enqueue a `_proeprtiesChanged` callback
         * @protected
         * @override
         */
        _shouldPropertyChange(property, value, old) {
          return (
            // Strict equality check
            (old !== value &&
              // This ensures (old==NaN, value==NaN) always returns false
              (old === old || value === value))
          );
        }

        /**
         * Implements native Custom Elements `attributeChangedCallback` to
         * set an attribute value to a property via `_attributeToProperty`.
         *
         * @param {string} name Name of attribute that changed
         * @param {?string} old Old attribute value
         * @param {?string} value New attribute value
         * @param {?string} namespace Attribute namespace.
         * @return {void}
         * @suppress {missingProperties} Super may or may not implement the callback
         * @override
         */
        attributeChangedCallback(name, old, value, namespace) {
          if (old !== value) {
            this._attributeToProperty(name, value);
          }
          if (super.attributeChangedCallback) {
            super.attributeChangedCallback(name, old, value, namespace);
          }
        }

        /**
         * Deserializes an attribute to its associated property.
         *
         * This method calls the `_deserializeValue` method to convert the string to
         * a typed value.
         *
         * @param {string} attribute Name of attribute to deserialize.
         * @param {?string} value of the attribute.
         * @param {*=} type type to deserialize to, defaults to the value
         * returned from `typeForProperty`
         * @return {void}
         * @override
         */
        _attributeToProperty(attribute, value, type) {
          if (!this.__serializing) {
            const map = this.__dataAttributes;
            const property = map && map[attribute] || attribute;
            this[property] = this._deserializeValue(value, type ||
              this.constructor.typeForProperty(property));
          }
        }

        /**
         * Serializes a property to its associated attribute.
         *
         * @suppress {invalidCasts} Closure can't figure out `this` is an element.
         *
         * @param {string} property Property name to reflect.
         * @param {string=} attribute Attribute name to reflect to.
         * @param {*=} value Property value to refect.
         * @return {void}
         * @override
         */
        _propertyToAttribute(property, attribute, value) {
          this.__serializing = true;
          value = (arguments.length < 3) ? this[property] : value;
          this._valueToNodeAttribute(/** @type {!HTMLElement} */(this), value,
            attribute || this.constructor.attributeNameForProperty(property));
          this.__serializing = false;
        }

        /**
         * Sets a typed value to an HTML attribute on a node.
         *
         * This method calls the `_serializeValue` method to convert the typed
         * value to a string.  If the `_serializeValue` method returns `undefined`,
         * the attribute will be removed (this is the default for boolean
         * type `false`).
         *
         * @param {Element} node Element to set attribute to.
         * @param {*} value Value to serialize.
         * @param {string} attribute Attribute name to serialize to.
         * @return {void}
         * @override
         */
        _valueToNodeAttribute(node, value, attribute) {
          const str = this._serializeValue(value);
          if (str === undefined) {
            node.removeAttribute(attribute);
          } else {
            node.setAttribute(attribute, str);
          }
        }

        /**
         * Converts a typed JavaScript value to a string.
         *
         * This method is called when setting JS property values to
         * HTML attributes.  Users may override this method to provide
         * serialization for custom types.
         *
         * @param {*} value Property value to serialize.
         * @return {string | undefined} String serialized from the provided
         * property  value.
         * @override
         */
        _serializeValue(value) {
          switch (typeof value) {
            case 'boolean':
              return value ? '' : undefined;
            default:
              return value != null ? value.toString() : undefined;
          }
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * This method is called when reading HTML attribute values to
         * JS properties.  Users may override this method to provide
         * deserialization for custom `type`s. Types for `Boolean`, `String`,
         * and `Number` convert attributes to the expected types.
         *
         * @param {?string} value Value to deserialize.
         * @param {*=} type Type to deserialize the string to.
         * @return {*} Typed value deserialized from the provided string.
         * @override
         */
        _deserializeValue(value, type) {
          switch (type) {
            case Boolean:
              return (value !== null);
            case Number:
              return Number(value);
            default:
              return value;
          }
        }

      }

      return PropertiesChanged;
    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let caseMap$1 = caseMap$0;

    // Save map of native properties; this forms a blacklist or properties
    // that won't have their values "saved" by `saveAccessorValue`, since
    // reading from an HTMLElement accessor from the context of a prototype throws
    const nativeProperties = {};
    let proto = HTMLElement.prototype;
    while (proto) {
      let props = Object.getOwnPropertyNames(proto);
      for (let i=0; i<props.length; i++) {
        nativeProperties[props[i]] = true;
      }
      proto = Object.getPrototypeOf(proto);
    }

    /**
     * Used to save the value of a property that will be overridden with
     * an accessor. If the `model` is a prototype, the values will be saved
     * in `__dataProto`, and it's up to the user (or downstream mixin) to
     * decide how/when to set these values back into the accessors.
     * If `model` is already an instance (it has a `__data` property), then
     * the value will be set as a pending property, meaning the user should
     * call `_invalidateProperties` or `_flushProperties` to take effect
     *
     * @param {Object} model Prototype or instance
     * @param {string} property Name of property
     * @return {void}
     * @private
     */
    function saveAccessorValue(model, property) {
      // Don't read/store value for any native properties since they could throw
      if (!nativeProperties[property]) {
        let value = model[property];
        if (value !== undefined) {
          if (model.__data) {
            // Adding accessor to instance; update the property
            // It is the user's responsibility to call _flushProperties
            model._setPendingProperty(property, value);
          } else {
            // Adding accessor to proto; save proto's value for instance-time use
            if (!model.__dataProto) {
              model.__dataProto = {};
            } else if (!model.hasOwnProperty(JSCompiler_renameProperty('__dataProto', model))) {
              model.__dataProto = Object.create(model.__dataProto);
            }
            model.__dataProto[property] = value;
          }
        }
      }
    }

    /**
     * Element class mixin that provides basic meta-programming for creating one
     * or more property accessors (getter/setter pair) that enqueue an async
     * (batched) `_propertiesChanged` callback.
     *
     * For basic usage of this mixin:
     *
     * -   Declare attributes to observe via the standard `static get observedAttributes()`. Use
     *     `dash-case` attribute names to represent `camelCase` property names.
     * -   Implement the `_propertiesChanged` callback on the class.
     * -   Call `MyClass.createPropertiesForAttributes()` **once** on the class to generate
     *     property accessors for each observed attribute. This must be called before the first
     *     instance is created, for example, by calling it before calling `customElements.define`.
     *     It can also be called lazily from the element's `constructor`, as long as it's guarded so
     *     that the call is only made once, when the first instance is created.
     * -   Call `this._enableProperties()` in the element's `connectedCallback` to enable
     *     the accessors.
     *
     * Any `observedAttributes` will automatically be
     * deserialized via `attributeChangedCallback` and set to the associated
     * property using `dash-case`-to-`camelCase` convention.
     *
     * @mixinFunction
     * @polymer
     * @appliesMixin PropertiesChanged
     * @summary Element class mixin for reacting to property changes from
     *   generated property accessors.
     */
    const PropertyAccessors = dedupingMixin(superClass => {

      /**
       * @constructor
       * @extends {superClass}
       * @implements {Polymer_PropertiesChanged}
       * @unrestricted
       * @private
       */
       const base = PropertiesChanged(superClass);

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_PropertyAccessors}
       * @extends {base}
       * @unrestricted
       */
      class PropertyAccessors extends base {

        /**
         * Generates property accessors for all attributes in the standard
         * static `observedAttributes` array.
         *
         * Attribute names are mapped to property names using the `dash-case` to
         * `camelCase` convention
         *
         * @return {void}
         */
        static createPropertiesForAttributes() {
          let a$ = this.observedAttributes;
          for (let i=0; i < a$.length; i++) {
            this.prototype._createPropertyAccessor(caseMap$1.dashToCamelCase(a$[i]));
          }
        }

        /**
         * Returns an attribute name that corresponds to the given property.
         * By default, converts camel to dash case, e.g. `fooBar` to `foo-bar`.
         * @param {string} property Property to convert
         * @return {string} Attribute name corresponding to the given property.
         *
         * @protected
         */
        static attributeNameForProperty(property) {
          return caseMap$1.camelToDashCase(property);
        }

        /**
         * Overrides PropertiesChanged implementation to initialize values for
         * accessors created for values that already existed on the element
         * prototype.
         *
         * @return {void}
         * @protected
         */
        _initializeProperties() {
          if (this.__dataProto) {
            this._initializeProtoProperties(this.__dataProto);
            this.__dataProto = null;
          }
          super._initializeProperties();
        }

        /**
         * Called at instance time with bag of properties that were overwritten
         * by accessors on the prototype when accessors were created.
         *
         * The default implementation sets these properties back into the
         * setter at instance time.  This method is provided as an override
         * point for customizing or providing more efficient initialization.
         *
         * @param {Object} props Bag of property values that were overwritten
         *   when creating property accessors.
         * @return {void}
         * @protected
         */
        _initializeProtoProperties(props) {
          for (let p in props) {
            this._setProperty(p, props[p]);
          }
        }

        /**
         * Ensures the element has the given attribute. If it does not,
         * assigns the given value to the attribute.
         *
         * @suppress {invalidCasts} Closure can't figure out `this` is infact an element
         *
         * @param {string} attribute Name of attribute to ensure is set.
         * @param {string} value of the attribute.
         * @return {void}
         */
        _ensureAttribute(attribute, value) {
          const el = /** @type {!HTMLElement} */(this);
          if (!el.hasAttribute(attribute)) {
            this._valueToNodeAttribute(el, value, attribute);
          }
        }

        /**
         * Overrides PropertiesChanged implemention to serialize objects as JSON.
         *
         * @param {*} value Property value to serialize.
         * @return {string | undefined} String serialized from the provided property value.
         */
        _serializeValue(value) {
          /* eslint-disable no-fallthrough */
          switch (typeof value) {
            case 'object':
              if (value instanceof Date) {
                return value.toString();
              } else if (value) {
                try {
                  return JSON.stringify(value);
                } catch(x) {
                  return '';
                }
              }

            default:
              return super._serializeValue(value);
          }
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * This method is called by Polymer when reading HTML attribute values to
         * JS properties.  Users may override this method on Polymer element
         * prototypes to provide deserialization for custom `type`s.  Note,
         * the `type` argument is the value of the `type` field provided in the
         * `properties` configuration object for a given property, and is
         * by convention the constructor for the type to deserialize.
         *
         *
         * @param {?string} value Attribute value to deserialize.
         * @param {*=} type Type to deserialize the string to.
         * @return {*} Typed value deserialized from the provided string.
         */
        _deserializeValue(value, type) {
          /**
           * @type {*}
           */
          let outValue;
          switch (type) {
            case Object:
              try {
                outValue = JSON.parse(/** @type {string} */(value));
              } catch(x) {
                // allow non-JSON literals like Strings and Numbers
                outValue = value;
              }
              break;
            case Array:
              try {
                outValue = JSON.parse(/** @type {string} */(value));
              } catch(x) {
                outValue = null;
                console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${value}`);
              }
              break;
            case Date:
              outValue = isNaN(value) ? String(value) : Number(value);
              outValue = new Date(outValue);
              break;
            default:
              outValue = super._deserializeValue(value, type);
              break;
          }
          return outValue;
        }
        /* eslint-enable no-fallthrough */

        /**
         * Overrides PropertiesChanged implementation to save existing prototype
         * property value so that it can be reset.
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created
         *
         * When calling on a prototype, any overwritten values are saved in
         * `__dataProto`, and it is up to the subclasser to decide how/when
         * to set those properties back into the accessor.  When calling on an
         * instance, the overwritten value is set via `_setPendingProperty`,
         * and the user should call `_invalidateProperties` or `_flushProperties`
         * for the values to take effect.
         * @protected
         * @return {void}
         */
        _definePropertyAccessor(property, readOnly) {
          saveAccessorValue(this, property);
          super._definePropertyAccessor(property, readOnly);
        }

        /**
         * Returns true if this library created an accessor for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if an accessor was created
         */
        _hasAccessor(property) {
          return this.__dataHasAccessor && this.__dataHasAccessor[property];
        }

        /**
         * Returns true if the specified property has a pending change.
         *
         * @param {string} prop Property name
         * @return {boolean} True if property has a pending change
         * @protected
         */
        _isPropertyPending(prop) {
          return Boolean(this.__dataPending && (prop in this.__dataPending));
        }

      }

      return PropertyAccessors;

    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // 1.x backwards-compatible auto-wrapper for template type extensions
    // This is a clear layering violation and gives favored-nation status to
    // dom-if and dom-repeat templates.  This is a conceit we're choosing to keep
    // a.) to ease 1.x backwards-compatibility due to loss of `is`, and
    // b.) to maintain if/repeat capability in parser-constrained elements
    //     (e.g. table, select) in lieu of native CE type extensions without
    //     massive new invention in this space (e.g. directive system)
    const templateExtensions = {
      'dom-if': true,
      'dom-repeat': true
    };
    function wrapTemplateExtension(node) {
      let is = node.getAttribute('is');
      if (is && templateExtensions[is]) {
        let t = node;
        t.removeAttribute('is');
        node = t.ownerDocument.createElement(is);
        t.parentNode.replaceChild(node, t);
        node.appendChild(t);
        while(t.attributes.length) {
          node.setAttribute(t.attributes[0].name, t.attributes[0].value);
          t.removeAttribute(t.attributes[0].name);
        }
      }
      return node;
    }

    function findTemplateNode(root, nodeInfo) {
      // recursively ascend tree until we hit root
      let parent = nodeInfo.parentInfo && findTemplateNode(root, nodeInfo.parentInfo);
      // unwind the stack, returning the indexed node at each level
      if (parent) {
        // note: marginally faster than indexing via childNodes
        // (http://jsperf.com/childnodes-lookup)
        for (let n=parent.firstChild, i=0; n; n=n.nextSibling) {
          if (nodeInfo.parentIndex === i++) {
            return n;
          }
        }
      } else {
        return root;
      }
    }

    // construct `$` map (from id annotations)
    function applyIdToMap(inst, map, node, nodeInfo) {
      if (nodeInfo.id) {
        map[nodeInfo.id] = node;
      }
    }

    // install event listeners (from event annotations)
    function applyEventListener(inst, node, nodeInfo) {
      if (nodeInfo.events && nodeInfo.events.length) {
        for (let j=0, e$=nodeInfo.events, e; (j<e$.length) && (e=e$[j]); j++) {
          inst._addMethodEventListenerToNode(node, e.name, e.value, inst);
        }
      }
    }

    // push configuration references at configure time
    function applyTemplateContent(inst, node, nodeInfo) {
      if (nodeInfo.templateInfo) {
        node._templateInfo = nodeInfo.templateInfo;
      }
    }

    function createNodeEventHandler(context, eventName, methodName) {
      // Instances can optionally have a _methodHost which allows redirecting where
      // to find methods. Currently used by `templatize`.
      context = context._methodHost || context;
      let handler = function(e) {
        if (context[methodName]) {
          context[methodName](e, e.detail);
        } else {
          console.warn('listener method `' + methodName + '` not defined');
        }
      };
      return handler;
    }

    /**
     * Element mixin that provides basic template parsing and stamping, including
     * the following template-related features for stamped templates:
     *
     * - Declarative event listeners (`on-eventname="listener"`)
     * - Map of node id's to stamped node instances (`this.$.id`)
     * - Nested template content caching/removal and re-installation (performance
     *   optimization)
     *
     * @mixinFunction
     * @polymer
     * @summary Element class mixin that provides basic template parsing and stamping
     */
    const TemplateStamp = dedupingMixin(
        /**
         * @template T
         * @param {function(new:T)} superClass Class to apply mixin to.
         * @return {function(new:T)} superClass with mixin applied.
         */
        (superClass) => {

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_TemplateStamp}
       */
      class TemplateStamp extends superClass {

        /**
         * Scans a template to produce template metadata.
         *
         * Template-specific metadata are stored in the object returned, and node-
         * specific metadata are stored in objects in its flattened `nodeInfoList`
         * array.  Only nodes in the template that were parsed as nodes of
         * interest contain an object in `nodeInfoList`.  Each `nodeInfo` object
         * contains an `index` (`childNodes` index in parent) and optionally
         * `parent`, which points to node info of its parent (including its index).
         *
         * The template metadata object returned from this method has the following
         * structure (many fields optional):
         *
         * ```js
         *   {
         *     // Flattened list of node metadata (for nodes that generated metadata)
         *     nodeInfoList: [
         *       {
         *         // `id` attribute for any nodes with id's for generating `$` map
         *         id: {string},
         *         // `on-event="handler"` metadata
         *         events: [
         *           {
         *             name: {string},   // event name
         *             value: {string},  // handler method name
         *           }, ...
         *         ],
         *         // Notes when the template contained a `<slot>` for shady DOM
         *         // optimization purposes
         *         hasInsertionPoint: {boolean},
         *         // For nested `<template>`` nodes, nested template metadata
         *         templateInfo: {object}, // nested template metadata
         *         // Metadata to allow efficient retrieval of instanced node
         *         // corresponding to this metadata
         *         parentInfo: {number},   // reference to parent nodeInfo>
         *         parentIndex: {number},  // index in parent's `childNodes` collection
         *         infoIndex: {number},    // index of this `nodeInfo` in `templateInfo.nodeInfoList`
         *       },
         *       ...
         *     ],
         *     // When true, the template had the `strip-whitespace` attribute
         *     // or was nested in a template with that setting
         *     stripWhitespace: {boolean},
         *     // For nested templates, nested template content is moved into
         *     // a document fragment stored here; this is an optimization to
         *     // avoid the cost of nested template cloning
         *     content: {DocumentFragment}
         *   }
         * ```
         *
         * This method kicks off a recursive treewalk as follows:
         *
         * ```
         *    _parseTemplate <---------------------+
         *      _parseTemplateContent              |
         *        _parseTemplateNode  <------------|--+
         *          _parseTemplateNestedTemplate --+  |
         *          _parseTemplateChildNodes ---------+
         *          _parseTemplateNodeAttributes
         *            _parseTemplateNodeAttribute
         *
         * ```
         *
         * These methods may be overridden to add custom metadata about templates
         * to either `templateInfo` or `nodeInfo`.
         *
         * Note that this method may be destructive to the template, in that
         * e.g. event annotations may be removed after being noted in the
         * template metadata.
         *
         * @param {!HTMLTemplateElement} template Template to parse
         * @param {TemplateInfo=} outerTemplateInfo Template metadata from the outer
         *   template, for parsing nested templates
         * @return {!TemplateInfo} Parsed template metadata
         */
        static _parseTemplate(template, outerTemplateInfo) {
          // since a template may be re-used, memo-ize metadata
          if (!template._templateInfo) {
            let templateInfo = template._templateInfo = {};
            templateInfo.nodeInfoList = [];
            templateInfo.stripWhiteSpace =
              (outerTemplateInfo && outerTemplateInfo.stripWhiteSpace) ||
              template.hasAttribute('strip-whitespace');
            this._parseTemplateContent(template, templateInfo, {parent: null});
          }
          return template._templateInfo;
        }

        static _parseTemplateContent(template, templateInfo, nodeInfo) {
          return this._parseTemplateNode(template.content, templateInfo, nodeInfo);
        }

        /**
         * Parses template node and adds template and node metadata based on
         * the current node, and its `childNodes` and `attributes`.
         *
         * This method may be overridden to add custom node or template specific
         * metadata based on this node.
         *
         * @param {Node} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */
        static _parseTemplateNode(node, templateInfo, nodeInfo) {
          let noted;
          let element = /** @type {Element} */(node);
          if (element.localName == 'template' && !element.hasAttribute('preserve-content')) {
            noted = this._parseTemplateNestedTemplate(element, templateInfo, nodeInfo) || noted;
          } else if (element.localName === 'slot') {
            // For ShadyDom optimization, indicating there is an insertion point
            templateInfo.hasInsertionPoint = true;
          }
          if (element.firstChild) {
            noted = this._parseTemplateChildNodes(element, templateInfo, nodeInfo) || noted;
          }
          if (element.hasAttributes && element.hasAttributes()) {
            noted = this._parseTemplateNodeAttributes(element, templateInfo, nodeInfo) || noted;
          }
          return noted;
        }

        /**
         * Parses template child nodes for the given root node.
         *
         * This method also wraps whitelisted legacy template extensions
         * (`is="dom-if"` and `is="dom-repeat"`) with their equivalent element
         * wrappers, collapses text nodes, and strips whitespace from the template
         * if the `templateInfo.stripWhitespace` setting was provided.
         *
         * @param {Node} root Root node whose `childNodes` will be parsed
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {void}
         */
        static _parseTemplateChildNodes(root, templateInfo, nodeInfo) {
          if (root.localName === 'script' || root.localName === 'style') {
            return;
          }
          for (let node=root.firstChild, parentIndex=0, next; node; node=next) {
            // Wrap templates
            if (node.localName == 'template') {
              node = wrapTemplateExtension(node);
            }
            // collapse adjacent textNodes: fixes an IE issue that can cause
            // text nodes to be inexplicably split =(
            // note that root.normalize() should work but does not so we do this
            // manually.
            next = node.nextSibling;
            if (node.nodeType === Node.TEXT_NODE) {
              let /** Node */ n = next;
              while (n && (n.nodeType === Node.TEXT_NODE)) {
                node.textContent += n.textContent;
                next = n.nextSibling;
                root.removeChild(n);
                n = next;
              }
              // optionally strip whitespace
              if (templateInfo.stripWhiteSpace && !node.textContent.trim()) {
                root.removeChild(node);
                continue;
              }
            }
            let childInfo = { parentIndex, parentInfo: nodeInfo };
            if (this._parseTemplateNode(node, templateInfo, childInfo)) {
              childInfo.infoIndex = templateInfo.nodeInfoList.push(/** @type {!NodeInfo} */(childInfo)) - 1;
            }
            // Increment if not removed
            if (node.parentNode) {
              parentIndex++;
            }
          }
        }

        /**
         * Parses template content for the given nested `<template>`.
         *
         * Nested template info is stored as `templateInfo` in the current node's
         * `nodeInfo`. `template.content` is removed and stored in `templateInfo`.
         * It will then be the responsibility of the host to set it back to the
         * template and for users stamping nested templates to use the
         * `_contentForTemplate` method to retrieve the content for this template
         * (an optimization to avoid the cost of cloning nested template content).
         *
         * @param {HTMLTemplateElement} node Node to parse (a <template>)
         * @param {TemplateInfo} outerTemplateInfo Template metadata for current template
         *   that includes the template `node`
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */
        static _parseTemplateNestedTemplate(node, outerTemplateInfo, nodeInfo) {
          let templateInfo = this._parseTemplate(node, outerTemplateInfo);
          let content = templateInfo.content =
            node.content.ownerDocument.createDocumentFragment();
          content.appendChild(node.content);
          nodeInfo.templateInfo = templateInfo;
          return true;
        }

        /**
         * Parses template node attributes and adds node metadata to `nodeInfo`
         * for nodes of interest.
         *
         * @param {Element} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */
        static _parseTemplateNodeAttributes(node, templateInfo, nodeInfo) {
          // Make copy of original attribute list, since the order may change
          // as attributes are added and removed
          let noted = false;
          let attrs = Array.from(node.attributes);
          for (let i=attrs.length-1, a; (a=attrs[i]); i--) {
            noted = this._parseTemplateNodeAttribute(node, templateInfo, nodeInfo, a.name, a.value) || noted;
          }
          return noted;
        }

        /**
         * Parses a single template node attribute and adds node metadata to
         * `nodeInfo` for attributes of interest.
         *
         * This implementation adds metadata for `on-event="handler"` attributes
         * and `id` attributes.
         *
         * @param {Element} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @param {string} name Attribute name
         * @param {string} value Attribute value
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         */
        static _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
          // events (on-*)
          if (name.slice(0, 3) === 'on-') {
            node.removeAttribute(name);
            nodeInfo.events = nodeInfo.events || [];
            nodeInfo.events.push({
              name: name.slice(3),
              value
            });
            return true;
          }
          // static id
          else if (name === 'id') {
            nodeInfo.id = value;
            return true;
          }
          return false;
        }

        /**
         * Returns the `content` document fragment for a given template.
         *
         * For nested templates, Polymer performs an optimization to cache nested
         * template content to avoid the cost of cloning deeply nested templates.
         * This method retrieves the cached content for a given template.
         *
         * @param {HTMLTemplateElement} template Template to retrieve `content` for
         * @return {DocumentFragment} Content fragment
         */
        static _contentForTemplate(template) {
          let templateInfo = /** @type {HTMLTemplateElementWithInfo} */ (template)._templateInfo;
          return (templateInfo && templateInfo.content) || template.content;
        }

        /**
         * Clones the provided template content and returns a document fragment
         * containing the cloned dom.
         *
         * The template is parsed (once and memoized) using this library's
         * template parsing features, and provides the following value-added
         * features:
         * * Adds declarative event listeners for `on-event="handler"` attributes
         * * Generates an "id map" for all nodes with id's under `$` on returned
         *   document fragment
         * * Passes template info including `content` back to templates as
         *   `_templateInfo` (a performance optimization to avoid deep template
         *   cloning)
         *
         * Note that the memoized template parsing process is destructive to the
         * template: attributes for bindings and declarative event listeners are
         * removed after being noted in notes, and any nested `<template>.content`
         * is removed and stored in notes as well.
         *
         * @param {!HTMLTemplateElement} template Template to stamp
         * @return {!StampedTemplate} Cloned template content
         * @override
         */
        _stampTemplate(template) {
          // Polyfill support: bootstrap the template if it has not already been
          if (template && !template.content &&
              window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
            HTMLTemplateElement.decorate(template);
          }
          let templateInfo = this.constructor._parseTemplate(template);
          let nodeInfo = templateInfo.nodeInfoList;
          let content = templateInfo.content || template.content;
          let dom = /** @type {DocumentFragment} */ (document.importNode(content, true));
          // NOTE: ShadyDom optimization indicating there is an insertion point
          dom.__noInsertionPoint = !templateInfo.hasInsertionPoint;
          let nodes = dom.nodeList = new Array(nodeInfo.length);
          dom.$ = {};
          for (let i=0, l=nodeInfo.length, info; (i<l) && (info=nodeInfo[i]); i++) {
            let node = nodes[i] = findTemplateNode(dom, info);
            applyIdToMap(this, dom.$, node, info);
            applyTemplateContent(this, node, info);
            applyEventListener(this, node, info);
          }
          dom = /** @type {!StampedTemplate} */(dom); // eslint-disable-line no-self-assign
          return dom;
        }

        /**
         * Adds an event listener by method name for the event provided.
         *
         * This method generates a handler function that looks up the method
         * name at handling time.
         *
         * @param {!Node} node Node to add listener on
         * @param {string} eventName Name of event
         * @param {string} methodName Name of method
         * @param {*=} context Context the method will be called on (defaults
         *   to `node`)
         * @return {Function} Generated handler function
         * @override
         */
        _addMethodEventListenerToNode(node, eventName, methodName, context) {
          context = context || node;
          let handler = createNodeEventHandler(context, eventName, methodName);
          this._addEventListenerToNode(node, eventName, handler);
          return handler;
        }

        /**
         * Override point for adding custom or simulated event handling.
         *
         * @param {!Node} node Node to add event listener to
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to add
         * @return {void}
         * @override
         */
        _addEventListenerToNode(node, eventName, handler) {
          node.addEventListener(eventName, handler);
        }

        /**
         * Override point for adding custom or simulated event handling.
         *
         * @param {!Node} node Node to remove event listener from
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to remove
         * @return {void}
         * @override
         */
        _removeEventListenerFromNode(node, eventName, handler) {
          node.removeEventListener(eventName, handler);
        }

      }

      return TemplateStamp;

    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /** @const {Object} */
    const CaseMap = caseMap$0;

    // Monotonically increasing unique ID used for de-duping effects triggered
    // from multiple properties in the same turn
    let dedupeId$1 = 0;

    /**
     * Property effect types; effects are stored on the prototype using these keys
     * @enum {string}
     */
    const TYPES = {
      COMPUTE: '__computeEffects',
      REFLECT: '__reflectEffects',
      NOTIFY: '__notifyEffects',
      PROPAGATE: '__propagateEffects',
      OBSERVE: '__observeEffects',
      READ_ONLY: '__readOnly'
    };

    /** @const {RegExp} */
    const capitalAttributeRegex = /[A-Z]/;

    /**
     * Ensures that the model has an own-property map of effects for the given type.
     * The model may be a prototype or an instance.
     *
     * Property effects are stored as arrays of effects by property in a map,
     * by named type on the model. e.g.
     *
     *   __computeEffects: {
     *     foo: [ ... ],
     *     bar: [ ... ]
     *   }
     *
     * If the model does not yet have an effect map for the type, one is created
     * and returned.  If it does, but it is not an own property (i.e. the
     * prototype had effects), the the map is deeply cloned and the copy is
     * set on the model and returned, ready for new effects to be added.
     *
     * @param {Object} model Prototype or instance
     * @param {string} type Property effect type
     * @return {Object} The own-property map of effects for the given type
     * @private
     */
    function ensureOwnEffectMap(model, type) {
      let effects = model[type];
      if (!effects) {
        effects = model[type] = {};
      } else if (!model.hasOwnProperty(type)) {
        effects = model[type] = Object.create(model[type]);
        for (let p in effects) {
          let protoFx = effects[p];
          let instFx = effects[p] = Array(protoFx.length);
          for (let i=0; i<protoFx.length; i++) {
            instFx[i] = protoFx[i];
          }
        }
      }
      return effects;
    }

    // -- effects ----------------------------------------------

    /**
     * Runs all effects of a given type for the given set of property changes
     * on an instance.
     *
     * @param {!PropertyEffectsType} inst The instance with effects to run
     * @param {Object} effects Object map of property-to-Array of effects
     * @param {Object} props Bag of current property changes
     * @param {Object=} oldProps Bag of previous values for changed properties
     * @param {boolean=} hasPaths True with `props` contains one or more paths
     * @param {*=} extraArgs Additional metadata to pass to effect function
     * @return {boolean} True if an effect ran for this property
     * @private
     */
    function runEffects(inst, effects, props, oldProps, hasPaths, extraArgs) {
      if (effects) {
        let ran = false;
        let id = dedupeId$1++;
        for (let prop in props) {
          if (runEffectsForProperty(inst, effects, id, prop, props, oldProps, hasPaths, extraArgs)) {
            ran = true;
          }
        }
        return ran;
      }
      return false;
    }

    /**
     * Runs a list of effects for a given property.
     *
     * @param {!PropertyEffectsType} inst The instance with effects to run
     * @param {Object} effects Object map of property-to-Array of effects
     * @param {number} dedupeId Counter used for de-duping effects
     * @param {string} prop Name of changed property
     * @param {*} props Changed properties
     * @param {*} oldProps Old properties
     * @param {boolean=} hasPaths True with `props` contains one or more paths
     * @param {*=} extraArgs Additional metadata to pass to effect function
     * @return {boolean} True if an effect ran for this property
     * @private
     */
    function runEffectsForProperty(inst, effects, dedupeId, prop, props, oldProps, hasPaths, extraArgs) {
      let ran = false;
      let rootProperty = hasPaths ? root(prop) : prop;
      let fxs = effects[rootProperty];
      if (fxs) {
        for (let i=0, l=fxs.length, fx; (i<l) && (fx=fxs[i]); i++) {
          if ((!fx.info || fx.info.lastRun !== dedupeId) &&
              (!hasPaths || pathMatchesTrigger(prop, fx.trigger))) {
            if (fx.info) {
              fx.info.lastRun = dedupeId;
            }
            fx.fn(inst, prop, props, oldProps, fx.info, hasPaths, extraArgs);
            ran = true;
          }
        }
      }
      return ran;
    }

    /**
     * Determines whether a property/path that has changed matches the trigger
     * criteria for an effect.  A trigger is a descriptor with the following
     * structure, which matches the descriptors returned from `parseArg`.
     * e.g. for `foo.bar.*`:
     * ```
     * trigger: {
     *   name: 'a.b',
     *   structured: true,
     *   wildcard: true
     * }
     * ```
     * If no trigger is given, the path is deemed to match.
     *
     * @param {string} path Path or property that changed
     * @param {DataTrigger} trigger Descriptor
     * @return {boolean} Whether the path matched the trigger
     */
    function pathMatchesTrigger(path, trigger) {
      if (trigger) {
        let triggerPath = trigger.name;
        return (triggerPath == path) ||
          (trigger.structured && isAncestor(triggerPath, path)) ||
          (trigger.wildcard && isDescendant(triggerPath, path));
      } else {
        return true;
      }
    }

    /**
     * Implements the "observer" effect.
     *
     * Calls the method with `info.methodName` on the instance, passing the
     * new and old values.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {string} property Name of property
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {?} info Effect metadata
     * @return {void}
     * @private
     */
    function runObserverEffect(inst, property, props, oldProps, info) {
      let fn = typeof info.method === "string" ? inst[info.method] : info.method;
      let changedProp = info.property;
      if (fn) {
        fn.call(inst, inst.__data[changedProp], oldProps[changedProp]);
      } else if (!info.dynamicFn) {
        console.warn('observer method `' + info.method + '` not defined');
      }
    }

    /**
     * Runs "notify" effects for a set of changed properties.
     *
     * This method differs from the generic `runEffects` method in that it
     * will dispatch path notification events in the case that the property
     * changed was a path and the root property for that path didn't have a
     * "notify" effect.  This is to maintain 1.0 behavior that did not require
     * `notify: true` to ensure object sub-property notifications were
     * sent.
     *
     * @param {!PropertyEffectsType} inst The instance with effects to run
     * @param {Object} notifyProps Bag of properties to notify
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {boolean} hasPaths True with `props` contains one or more paths
     * @return {void}
     * @private
     */
    function runNotifyEffects(inst, notifyProps, props, oldProps, hasPaths) {
      // Notify
      let fxs = inst[TYPES.NOTIFY];
      let notified;
      let id = dedupeId$1++;
      // Try normal notify effects; if none, fall back to try path notification
      for (let prop in notifyProps) {
        if (notifyProps[prop]) {
          if (fxs && runEffectsForProperty(inst, fxs, id, prop, props, oldProps, hasPaths)) {
            notified = true;
          } else if (hasPaths && notifyPath(inst, prop, props)) {
            notified = true;
          }
        }
      }
      // Flush host if we actually notified and host was batching
      // And the host has already initialized clients; this prevents
      // an issue with a host observing data changes before clients are ready.
      let host;
      if (notified && (host = inst.__dataHost) && host._invalidateProperties) {
        host._invalidateProperties();
      }
    }

    /**
     * Dispatches {property}-changed events with path information in the detail
     * object to indicate a sub-path of the property was changed.
     *
     * @param {!PropertyEffectsType} inst The element from which to fire the event
     * @param {string} path The path that was changed
     * @param {Object} props Bag of current property changes
     * @return {boolean} Returns true if the path was notified
     * @private
     */
    function notifyPath(inst, path, props) {
      let rootProperty = root(path);
      if (rootProperty !== path) {
        let eventName = camelToDashCase(rootProperty) + '-changed';
        dispatchNotifyEvent(inst, eventName, props[path], path);
        return true;
      }
      return false;
    }

    /**
     * Dispatches {property}-changed events to indicate a property (or path)
     * changed.
     *
     * @param {!PropertyEffectsType} inst The element from which to fire the event
     * @param {string} eventName The name of the event to send ('{property}-changed')
     * @param {*} value The value of the changed property
     * @param {string | null | undefined} path If a sub-path of this property changed, the path
     *   that changed (optional).
     * @return {void}
     * @private
     * @suppress {invalidCasts}
     */
    function dispatchNotifyEvent(inst, eventName, value, path) {
      let detail = {
        value: value,
        queueProperty: true
      };
      if (path) {
        detail.path = path;
      }
      /** @type {!HTMLElement} */(inst).dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    /**
     * Implements the "notify" effect.
     *
     * Dispatches a non-bubbling event named `info.eventName` on the instance
     * with a detail object containing the new `value`.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {string} property Name of property
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {?} info Effect metadata
     * @param {boolean} hasPaths True with `props` contains one or more paths
     * @return {void}
     * @private
     */
    function runNotifyEffect(inst, property, props, oldProps, info, hasPaths) {
      let rootProperty = hasPaths ? root(property) : property;
      let path = rootProperty != property ? property : null;
      let value = path ? get(inst, path) : inst.__data[property];
      if (path && value === undefined) {
        value = props[property];  // specifically for .splices
      }
      dispatchNotifyEvent(inst, info.eventName, value, path);
    }

    /**
     * Handler function for 2-way notification events. Receives context
     * information captured in the `addNotifyListener` closure from the
     * `__notifyListeners` metadata.
     *
     * Sets the value of the notified property to the host property or path.  If
     * the event contained path information, translate that path to the host
     * scope's name for that path first.
     *
     * @param {CustomEvent} event Notification event (e.g. '<property>-changed')
     * @param {!PropertyEffectsType} inst Host element instance handling the notification event
     * @param {string} fromProp Child element property that was bound
     * @param {string} toPath Host property/path that was bound
     * @param {boolean} negate Whether the binding was negated
     * @return {void}
     * @private
     */
    function handleNotification(event, inst, fromProp, toPath, negate) {
      let value;
      let detail = /** @type {Object} */(event.detail);
      let fromPath = detail && detail.path;
      if (fromPath) {
        toPath = translate(fromProp, toPath, fromPath);
        value = detail && detail.value;
      } else {
        value = event.target[fromProp];
      }
      value = negate ? !value : value;
      if (!inst[TYPES.READ_ONLY] || !inst[TYPES.READ_ONLY][toPath]) {
        if (inst._setPendingPropertyOrPath(toPath, value, true, Boolean(fromPath))
          && (!detail || !detail.queueProperty)) {
          inst._invalidateProperties();
        }
      }
    }

    /**
     * Implements the "reflect" effect.
     *
     * Sets the attribute named `info.attrName` to the given property value.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {string} property Name of property
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {?} info Effect metadata
     * @return {void}
     * @private
     */
    function runReflectEffect(inst, property, props, oldProps, info) {
      let value = inst.__data[property];
      if (sanitizeDOMValue) {
        value = sanitizeDOMValue(value, info.attrName, 'attribute', /** @type {Node} */(inst));
      }
      inst._propertyToAttribute(property, info.attrName, value);
    }

    /**
     * Runs "computed" effects for a set of changed properties.
     *
     * This method differs from the generic `runEffects` method in that it
     * continues to run computed effects based on the output of each pass until
     * there are no more newly computed properties.  This ensures that all
     * properties that will be computed by the initial set of changes are
     * computed before other effects (binding propagation, observers, and notify)
     * run.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {!Object} changedProps Bag of changed properties
     * @param {!Object} oldProps Bag of previous values for changed properties
     * @param {boolean} hasPaths True with `props` contains one or more paths
     * @return {void}
     * @private
     */
    function runComputedEffects(inst, changedProps, oldProps, hasPaths) {
      let computeEffects = inst[TYPES.COMPUTE];
      if (computeEffects) {
        let inputProps = changedProps;
        while (runEffects(inst, computeEffects, inputProps, oldProps, hasPaths)) {
          Object.assign(oldProps, inst.__dataOld);
          Object.assign(changedProps, inst.__dataPending);
          inputProps = inst.__dataPending;
          inst.__dataPending = null;
        }
      }
    }

    /**
     * Implements the "computed property" effect by running the method with the
     * values of the arguments specified in the `info` object and setting the
     * return value to the computed property specified.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {string} property Name of property
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {?} info Effect metadata
     * @return {void}
     * @private
     */
    function runComputedEffect(inst, property, props, oldProps, info) {
      let result = runMethodEffect(inst, property, props, oldProps, info);
      let computedProp = info.methodInfo;
      if (inst.__dataHasAccessor && inst.__dataHasAccessor[computedProp]) {
        inst._setPendingProperty(computedProp, result, true);
      } else {
        inst[computedProp] = result;
      }
    }

    /**
     * Computes path changes based on path links set up using the `linkPaths`
     * API.
     *
     * @param {!PropertyEffectsType} inst The instance whose props are changing
     * @param {string | !Array<(string|number)>} path Path that has changed
     * @param {*} value Value of changed path
     * @return {void}
     * @private
     */
    function computeLinkedPaths(inst, path, value) {
      let links = inst.__dataLinkedPaths;
      if (links) {
        let link;
        for (let a in links) {
          let b = links[a];
          if (isDescendant(a, path)) {
            link = translate(a, b, path);
            inst._setPendingPropertyOrPath(link, value, true, true);
          } else if (isDescendant(b, path)) {
            link = translate(b, a, path);
            inst._setPendingPropertyOrPath(link, value, true, true);
          }
        }
      }
    }

    // -- bindings ----------------------------------------------

    /**
     * Adds binding metadata to the current `nodeInfo`, and binding effects
     * for all part dependencies to `templateInfo`.
     *
     * @param {Function} constructor Class that `_parseTemplate` is currently
     *   running on
     * @param {TemplateInfo} templateInfo Template metadata for current template
     * @param {NodeInfo} nodeInfo Node metadata for current template node
     * @param {string} kind Binding kind, either 'property', 'attribute', or 'text'
     * @param {string} target Target property name
     * @param {!Array<!BindingPart>} parts Array of binding part metadata
     * @param {string=} literal Literal text surrounding binding parts (specified
     *   only for 'property' bindings, since these must be initialized as part
     *   of boot-up)
     * @return {void}
     * @private
     */
    function addBinding(constructor, templateInfo, nodeInfo, kind, target, parts, literal) {
      // Create binding metadata and add to nodeInfo
      nodeInfo.bindings = nodeInfo.bindings || [];
      let /** Binding */ binding = { kind, target, parts, literal, isCompound: (parts.length !== 1) };
      nodeInfo.bindings.push(binding);
      // Add listener info to binding metadata
      if (shouldAddListener(binding)) {
        let {event, negate} = binding.parts[0];
        binding.listenerEvent = event || (CaseMap.camelToDashCase(target) + '-changed');
        binding.listenerNegate = negate;
      }
      // Add "propagate" property effects to templateInfo
      let index = templateInfo.nodeInfoList.length;
      for (let i=0; i<binding.parts.length; i++) {
        let part = binding.parts[i];
        part.compoundIndex = i;
        addEffectForBindingPart(constructor, templateInfo, binding, part, index);
      }
    }

    /**
     * Adds property effects to the given `templateInfo` for the given binding
     * part.
     *
     * @param {Function} constructor Class that `_parseTemplate` is currently
     *   running on
     * @param {TemplateInfo} templateInfo Template metadata for current template
     * @param {!Binding} binding Binding metadata
     * @param {!BindingPart} part Binding part metadata
     * @param {number} index Index into `nodeInfoList` for this node
     * @return {void}
     */
    function addEffectForBindingPart(constructor, templateInfo, binding, part, index) {
      if (!part.literal) {
        if (binding.kind === 'attribute' && binding.target[0] === '-') {
          console.warn('Cannot set attribute ' + binding.target +
            ' because "-" is not a valid attribute starting character');
        } else {
          let dependencies = part.dependencies;
          let info = { index, binding, part, evaluator: constructor };
          for (let j=0; j<dependencies.length; j++) {
            let trigger = dependencies[j];
            if (typeof trigger == 'string') {
              trigger = parseArg(trigger);
              trigger.wildcard = true;
            }
            constructor._addTemplatePropertyEffect(templateInfo, trigger.rootProperty, {
              fn: runBindingEffect,
              info, trigger
            });
          }
        }
      }
    }

    /**
     * Implements the "binding" (property/path binding) effect.
     *
     * Note that binding syntax is overridable via `_parseBindings` and
     * `_evaluateBinding`.  This method will call `_evaluateBinding` for any
     * non-literal parts returned from `_parseBindings`.  However,
     * there is no support for _path_ bindings via custom binding parts,
     * as this is specific to Polymer's path binding syntax.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {string} path Name of property
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {?} info Effect metadata
     * @param {boolean} hasPaths True with `props` contains one or more paths
     * @param {Array} nodeList List of nodes associated with `nodeInfoList` template
     *   metadata
     * @return {void}
     * @private
     */
    function runBindingEffect(inst, path, props, oldProps, info, hasPaths, nodeList) {
      let node = nodeList[info.index];
      let binding = info.binding;
      let part = info.part;
      // Subpath notification: transform path and set to client
      // e.g.: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo.prop'=obj.sub.prop
      if (hasPaths && part.source && (path.length > part.source.length) &&
          (binding.kind == 'property') && !binding.isCompound &&
          node.__isPropertyEffectsClient &&
          node.__dataHasAccessor && node.__dataHasAccessor[binding.target]) {
        let value = props[path];
        path = translate(part.source, binding.target, path);
        if (node._setPendingPropertyOrPath(path, value, false, true)) {
          inst._enqueueClient(node);
        }
      } else {
        let value = info.evaluator._evaluateBinding(inst, part, path, props, oldProps, hasPaths);
        // Propagate value to child
        applyBindingValue(inst, node, binding, part, value);
      }
    }

    /**
     * Sets the value for an "binding" (binding) effect to a node,
     * either as a property or attribute.
     *
     * @param {!PropertyEffectsType} inst The instance owning the binding effect
     * @param {Node} node Target node for binding
     * @param {!Binding} binding Binding metadata
     * @param {!BindingPart} part Binding part metadata
     * @param {*} value Value to set
     * @return {void}
     * @private
     */
    function applyBindingValue(inst, node, binding, part, value) {
      value = computeBindingValue(node, value, binding, part);
      if (sanitizeDOMValue) {
        value = sanitizeDOMValue(value, binding.target, binding.kind, node);
      }
      if (binding.kind == 'attribute') {
        // Attribute binding
        inst._valueToNodeAttribute(/** @type {Element} */(node), value, binding.target);
      } else {
        // Property binding
        let prop = binding.target;
        if (node.__isPropertyEffectsClient &&
            node.__dataHasAccessor && node.__dataHasAccessor[prop]) {
          if (!node[TYPES.READ_ONLY] || !node[TYPES.READ_ONLY][prop]) {
            if (node._setPendingProperty(prop, value)) {
              inst._enqueueClient(node);
            }
          }
        } else  {
          inst._setUnmanagedPropertyToNode(node, prop, value);
        }
      }
    }

    /**
     * Transforms an "binding" effect value based on compound & negation
     * effect metadata, as well as handling for special-case properties
     *
     * @param {Node} node Node the value will be set to
     * @param {*} value Value to set
     * @param {!Binding} binding Binding metadata
     * @param {!BindingPart} part Binding part metadata
     * @return {*} Transformed value to set
     * @private
     */
    function computeBindingValue(node, value, binding, part) {
      if (binding.isCompound) {
        let storage = node.__dataCompoundStorage[binding.target];
        storage[part.compoundIndex] = value;
        value = storage.join('');
      }
      if (binding.kind !== 'attribute') {
        // Some browsers serialize `undefined` to `"undefined"`
        if (binding.target === 'textContent' ||
            (binding.target === 'value' &&
              (node.localName === 'input' || node.localName === 'textarea'))) {
          value = value == undefined ? '' : value;
        }
      }
      return value;
    }

    /**
     * Returns true if a binding's metadata meets all the requirements to allow
     * 2-way binding, and therefore a `<property>-changed` event listener should be
     * added:
     * - used curly braces
     * - is a property (not attribute) binding
     * - is not a textContent binding
     * - is not compound
     *
     * @param {!Binding} binding Binding metadata
     * @return {boolean} True if 2-way listener should be added
     * @private
     */
    function shouldAddListener(binding) {
      return Boolean(binding.target) &&
             binding.kind != 'attribute' &&
             binding.kind != 'text' &&
             !binding.isCompound &&
             binding.parts[0].mode === '{';
    }

    /**
     * Setup compound binding storage structures, notify listeners, and dataHost
     * references onto the bound nodeList.
     *
     * @param {!PropertyEffectsType} inst Instance that bas been previously bound
     * @param {TemplateInfo} templateInfo Template metadata
     * @return {void}
     * @private
     */
    function setupBindings(inst, templateInfo) {
      // Setup compound storage, dataHost, and notify listeners
      let {nodeList, nodeInfoList} = templateInfo;
      if (nodeInfoList.length) {
        for (let i=0; i < nodeInfoList.length; i++) {
          let info = nodeInfoList[i];
          let node = nodeList[i];
          let bindings = info.bindings;
          if (bindings) {
            for (let i=0; i<bindings.length; i++) {
              let binding = bindings[i];
              setupCompoundStorage(node, binding);
              addNotifyListener(node, inst, binding);
            }
          }
          node.__dataHost = inst;
        }
      }
    }

    /**
     * Initializes `__dataCompoundStorage` local storage on a bound node with
     * initial literal data for compound bindings, and sets the joined
     * literal parts to the bound property.
     *
     * When changes to compound parts occur, they are first set into the compound
     * storage array for that property, and then the array is joined to result in
     * the final value set to the property/attribute.
     *
     * @param {Node} node Bound node to initialize
     * @param {Binding} binding Binding metadata
     * @return {void}
     * @private
     */
    function setupCompoundStorage(node, binding) {
      if (binding.isCompound) {
        // Create compound storage map
        let storage = node.__dataCompoundStorage ||
          (node.__dataCompoundStorage = {});
        let parts = binding.parts;
        // Copy literals from parts into storage for this binding
        let literals = new Array(parts.length);
        for (let j=0; j<parts.length; j++) {
          literals[j] = parts[j].literal;
        }
        let target = binding.target;
        storage[target] = literals;
        // Configure properties with their literal parts
        if (binding.literal && binding.kind == 'property') {
          node[target] = binding.literal;
        }
      }
    }

    /**
     * Adds a 2-way binding notification event listener to the node specified
     *
     * @param {Object} node Child element to add listener to
     * @param {!PropertyEffectsType} inst Host element instance to handle notification event
     * @param {Binding} binding Binding metadata
     * @return {void}
     * @private
     */
    function addNotifyListener(node, inst, binding) {
      if (binding.listenerEvent) {
        let part = binding.parts[0];
        node.addEventListener(binding.listenerEvent, function(e) {
          handleNotification(e, inst, binding.target, part.source, part.negate);
        });
      }
    }

    // -- for method-based effects (complexObserver & computed) --------------

    /**
     * Adds property effects for each argument in the method signature (and
     * optionally, for the method name if `dynamic` is true) that calls the
     * provided effect function.
     *
     * @param {Element | Object} model Prototype or instance
     * @param {!MethodSignature} sig Method signature metadata
     * @param {string} type Type of property effect to add
     * @param {Function} effectFn Function to run when arguments change
     * @param {*=} methodInfo Effect-specific information to be included in
     *   method effect metadata
     * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
     *   method names should be included as a dependency to the effect. Note,
     *   defaults to true if the signature is static (sig.static is true).
     * @return {void}
     * @private
     */
    function createMethodEffect(model, sig, type, effectFn, methodInfo, dynamicFn) {
      dynamicFn = sig.static || (dynamicFn &&
        (typeof dynamicFn !== 'object' || dynamicFn[sig.methodName]));
      let info = {
        methodName: sig.methodName,
        args: sig.args,
        methodInfo,
        dynamicFn
      };
      for (let i=0, arg; (i<sig.args.length) && (arg=sig.args[i]); i++) {
        if (!arg.literal) {
          model._addPropertyEffect(arg.rootProperty, type, {
            fn: effectFn, info: info, trigger: arg
          });
        }
      }
      if (dynamicFn) {
        model._addPropertyEffect(sig.methodName, type, {
          fn: effectFn, info: info
        });
      }
    }

    /**
     * Calls a method with arguments marshaled from properties on the instance
     * based on the method signature contained in the effect metadata.
     *
     * Multi-property observers, computed properties, and inline computing
     * functions call this function to invoke the method, then use the return
     * value accordingly.
     *
     * @param {!PropertyEffectsType} inst The instance the effect will be run on
     * @param {string} property Name of property
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {?} info Effect metadata
     * @return {*} Returns the return value from the method invocation
     * @private
     */
    function runMethodEffect(inst, property, props, oldProps, info) {
      // Instances can optionally have a _methodHost which allows redirecting where
      // to find methods. Currently used by `templatize`.
      let context = inst._methodHost || inst;
      let fn = context[info.methodName];
      if (fn) {
        let args = marshalArgs(inst.__data, info.args, property, props);
        return fn.apply(context, args);
      } else if (!info.dynamicFn) {
        console.warn('method `' + info.methodName + '` not defined');
      }
    }

    const emptyArray = [];

    // Regular expressions used for binding
    const IDENT  = '(?:' + '[a-zA-Z_$][\\w.:$\\-*]*' + ')';
    const NUMBER = '(?:' + '[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?' + ')';
    const SQUOTE_STRING = '(?:' + '\'(?:[^\'\\\\]|\\\\.)*\'' + ')';
    const DQUOTE_STRING = '(?:' + '"(?:[^"\\\\]|\\\\.)*"' + ')';
    const STRING = '(?:' + SQUOTE_STRING + '|' + DQUOTE_STRING + ')';
    const ARGUMENT = '(?:(' + IDENT + '|' + NUMBER + '|' +  STRING + ')\\s*' + ')';
    const ARGUMENTS = '(?:' + ARGUMENT + '(?:,\\s*' + ARGUMENT + ')*' + ')';
    const ARGUMENT_LIST = '(?:' + '\\(\\s*' +
                                  '(?:' + ARGUMENTS + '?' + ')' +
                                '\\)\\s*' + ')';
    const BINDING = '(' + IDENT + '\\s*' + ARGUMENT_LIST + '?' + ')'; // Group 3
    const OPEN_BRACKET = '(\\[\\[|{{)' + '\\s*';
    const CLOSE_BRACKET = '(?:]]|}})';
    const NEGATE = '(?:(!)\\s*)?'; // Group 2
    const EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
    const bindingRegex = new RegExp(EXPRESSION, "g");

    /**
     * Create a string from binding parts of all the literal parts
     *
     * @param {!Array<BindingPart>} parts All parts to stringify
     * @return {string} String made from the literal parts
     */
    function literalFromParts(parts) {
      let s = '';
      for (let i=0; i<parts.length; i++) {
        let literal = parts[i].literal;
        s += literal || '';
      }
      return s;
    }

    /**
     * Parses an expression string for a method signature, and returns a metadata
     * describing the method in terms of `methodName`, `static` (whether all the
     * arguments are literals), and an array of `args`
     *
     * @param {string} expression The expression to parse
     * @return {?MethodSignature} The method metadata object if a method expression was
     *   found, otherwise `undefined`
     * @private
     */
    function parseMethod(expression) {
      // tries to match valid javascript property names
      let m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
      if (m) {
        let methodName = m[1];
        let sig = { methodName, static: true, args: emptyArray };
        if (m[2].trim()) {
          // replace escaped commas with comma entity, split on un-escaped commas
          let args = m[2].replace(/\\,/g, '&comma;').split(',');
          return parseArgs(args, sig);
        } else {
          return sig;
        }
      }
      return null;
    }

    /**
     * Parses an array of arguments and sets the `args` property of the supplied
     * signature metadata object. Sets the `static` property to false if any
     * argument is a non-literal.
     *
     * @param {!Array<string>} argList Array of argument names
     * @param {!MethodSignature} sig Method signature metadata object
     * @return {!MethodSignature} The updated signature metadata object
     * @private
     */
    function parseArgs(argList, sig) {
      sig.args = argList.map(function(rawArg) {
        let arg = parseArg(rawArg);
        if (!arg.literal) {
          sig.static = false;
        }
        return arg;
      }, this);
      return sig;
    }

    /**
     * Parses an individual argument, and returns an argument metadata object
     * with the following fields:
     *
     *   {
     *     value: 'prop',        // property/path or literal value
     *     literal: false,       // whether argument is a literal
     *     structured: false,    // whether the property is a path
     *     rootProperty: 'prop', // the root property of the path
     *     wildcard: false       // whether the argument was a wildcard '.*' path
     *   }
     *
     * @param {string} rawArg The string value of the argument
     * @return {!MethodArg} Argument metadata object
     * @private
     */
    function parseArg(rawArg) {
      // clean up whitespace
      let arg = rawArg.trim()
        // replace comma entity with comma
        .replace(/&comma;/g, ',')
        // repair extra escape sequences; note only commas strictly need
        // escaping, but we allow any other char to be escaped since its
        // likely users will do this
        .replace(/\\(.)/g, '\$1')
        ;
      // basic argument descriptor
      let a = {
        name: arg,
        value: '',
        literal: false
      };
      // detect literal value (must be String or Number)
      let fc = arg[0];
      if (fc === '-') {
        fc = arg[1];
      }
      if (fc >= '0' && fc <= '9') {
        fc = '#';
      }
      switch(fc) {
        case "'":
        case '"':
          a.value = arg.slice(1, -1);
          a.literal = true;
          break;
        case '#':
          a.value = Number(arg);
          a.literal = true;
          break;
      }
      // if not literal, look for structured path
      if (!a.literal) {
        a.rootProperty = root(arg);
        // detect structured path (has dots)
        a.structured = isPath(arg);
        if (a.structured) {
          a.wildcard = (arg.slice(-2) == '.*');
          if (a.wildcard) {
            a.name = arg.slice(0, -2);
          }
        }
      }
      return a;
    }

    /**
     * Gather the argument values for a method specified in the provided array
     * of argument metadata.
     *
     * The `path` and `value` arguments are used to fill in wildcard descriptor
     * when the method is being called as a result of a path notification.
     *
     * @param {Object} data Instance data storage object to read properties from
     * @param {!Array<!MethodArg>} args Array of argument metadata
     * @param {string} path Property/path name that triggered the method effect
     * @param {Object} props Bag of current property changes
     * @return {Array<*>} Array of argument values
     * @private
     */
    function marshalArgs(data, args, path, props) {
      let values = [];
      for (let i=0, l=args.length; i<l; i++) {
        let arg = args[i];
        let name = arg.name;
        let v;
        if (arg.literal) {
          v = arg.value;
        } else {
          if (arg.structured) {
            v = get(data, name);
            // when data is not stored e.g. `splices`
            if (v === undefined) {
              v = props[name];
            }
          } else {
            v = data[name];
          }
        }
        if (arg.wildcard) {
          // Only send the actual path changed info if the change that
          // caused the observer to run matched the wildcard
          let baseChanged = (name.indexOf(path + '.') === 0);
          let matches$$1 = (path.indexOf(name) === 0 && !baseChanged);
          values[i] = {
            path: matches$$1 ? path : name,
            value: matches$$1 ? props[path] : v,
            base: v
          };
        } else {
          values[i] = v;
        }
      }
      return values;
    }

    // data api

    /**
     * Sends array splice notifications (`.splices` and `.length`)
     *
     * Note: this implementation only accepts normalized paths
     *
     * @param {!PropertyEffectsType} inst Instance to send notifications to
     * @param {Array} array The array the mutations occurred on
     * @param {string} path The path to the array that was mutated
     * @param {Array} splices Array of splice records
     * @return {void}
     * @private
     */
    function notifySplices(inst, array, path, splices) {
      let splicesPath = path + '.splices';
      inst.notifyPath(splicesPath, { indexSplices: splices });
      inst.notifyPath(path + '.length', array.length);
      // Null here to allow potentially large splice records to be GC'ed.
      inst.__data[splicesPath] = {indexSplices: null};
    }

    /**
     * Creates a splice record and sends an array splice notification for
     * the described mutation
     *
     * Note: this implementation only accepts normalized paths
     *
     * @param {!PropertyEffectsType} inst Instance to send notifications to
     * @param {Array} array The array the mutations occurred on
     * @param {string} path The path to the array that was mutated
     * @param {number} index Index at which the array mutation occurred
     * @param {number} addedCount Number of added items
     * @param {Array} removed Array of removed items
     * @return {void}
     * @private
     */
    function notifySplice(inst, array, path, index, addedCount, removed) {
      notifySplices(inst, array, path, [{
        index: index,
        addedCount: addedCount,
        removed: removed,
        object: array,
        type: 'splice'
      }]);
    }

    /**
     * Returns an upper-cased version of the string.
     *
     * @param {string} name String to uppercase
     * @return {string} Uppercased string
     * @private
     */
    function upper(name) {
      return name[0].toUpperCase() + name.substring(1);
    }

    /**
     * Element class mixin that provides meta-programming for Polymer's template
     * binding and data observation (collectively, "property effects") system.
     *
     * This mixin uses provides the following key static methods for adding
     * property effects to an element class:
     * - `addPropertyEffect`
     * - `createPropertyObserver`
     * - `createMethodObserver`
     * - `createNotifyingProperty`
     * - `createReadOnlyProperty`
     * - `createReflectedProperty`
     * - `createComputedProperty`
     * - `bindTemplate`
     *
     * Each method creates one or more property accessors, along with metadata
     * used by this mixin's implementation of `_propertiesChanged` to perform
     * the property effects.
     *
     * Underscored versions of the above methods also exist on the element
     * prototype for adding property effects on instances at runtime.
     *
     * Note that this mixin overrides several `PropertyAccessors` methods, in
     * many cases to maintain guarantees provided by the Polymer 1.x features;
     * notably it changes property accessors to be synchronous by default
     * whereas the default when using `PropertyAccessors` standalone is to be
     * async by default.
     *
     * @mixinFunction
     * @polymer
     * @appliesMixin TemplateStamp
     * @appliesMixin PropertyAccessors
     * @summary Element class mixin that provides meta-programming for Polymer's
     * template binding and data observation system.
     */
    const PropertyEffects = dedupingMixin(superClass => {

      /**
       * @constructor
       * @extends {superClass}
       * @implements {Polymer_PropertyAccessors}
       * @implements {Polymer_TemplateStamp}
       * @unrestricted
       * @private
       */
      const propertyEffectsBase = TemplateStamp(PropertyAccessors(superClass));

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_PropertyEffects}
       * @extends {propertyEffectsBase}
       * @unrestricted
       */
      class PropertyEffects extends propertyEffectsBase {

        constructor() {
          super();
          /** @type {boolean} */
          // Used to identify users of this mixin, ala instanceof
          this.__isPropertyEffectsClient = true;
          /** @type {number} */
          // NOTE: used to track re-entrant calls to `_flushProperties`
          // path changes dirty check against `__dataTemp` only during one "turn"
          // and are cleared when `__dataCounter` returns to 0.
          this.__dataCounter = 0;
          /** @type {boolean} */
          this.__dataClientsReady;
          /** @type {Array} */
          this.__dataPendingClients;
          /** @type {Object} */
          this.__dataToNotify;
          /** @type {Object} */
          this.__dataLinkedPaths;
          /** @type {boolean} */
          this.__dataHasPaths;
          /** @type {Object} */
          this.__dataCompoundStorage;
          /** @type {Polymer_PropertyEffects} */
          this.__dataHost;
          /** @type {!Object} */
          this.__dataTemp;
          /** @type {boolean} */
          this.__dataClientsInitialized;
          /** @type {!Object} */
          this.__data;
          /** @type {!Object} */
          this.__dataPending;
          /** @type {!Object} */
          this.__dataOld;
          /** @type {Object} */
          this.__computeEffects;
          /** @type {Object} */
          this.__reflectEffects;
          /** @type {Object} */
          this.__notifyEffects;
          /** @type {Object} */
          this.__propagateEffects;
          /** @type {Object} */
          this.__observeEffects;
          /** @type {Object} */
          this.__readOnly;
          /** @type {!TemplateInfo} */
          this.__templateInfo;
        }

        get PROPERTY_EFFECT_TYPES() {
          return TYPES;
        }

        /**
         * @return {void}
         */
        _initializeProperties() {
          super._initializeProperties();
          hostStack.registerHost(this);
          this.__dataClientsReady = false;
          this.__dataPendingClients = null;
          this.__dataToNotify = null;
          this.__dataLinkedPaths = null;
          this.__dataHasPaths = false;
          // May be set on instance prior to upgrade
          this.__dataCompoundStorage = this.__dataCompoundStorage || null;
          this.__dataHost = this.__dataHost || null;
          this.__dataTemp = {};
          this.__dataClientsInitialized = false;
        }

        /**
         * Overrides `PropertyAccessors` implementation to provide a
         * more efficient implementation of initializing properties from
         * the prototype on the instance.
         *
         * @override
         * @param {Object} props Properties to initialize on the prototype
         * @return {void}
         */
        _initializeProtoProperties(props) {
          this.__data = Object.create(props);
          this.__dataPending = Object.create(props);
          this.__dataOld = {};
        }

        /**
         * Overrides `PropertyAccessors` implementation to avoid setting
         * `_setProperty`'s `shouldNotify: true`.
         *
         * @override
         * @param {Object} props Properties to initialize on the instance
         * @return {void}
         */
        _initializeInstanceProperties(props) {
          let readOnly = this[TYPES.READ_ONLY];
          for (let prop in props) {
            if (!readOnly || !readOnly[prop]) {
              this.__dataPending = this.__dataPending || {};
              this.__dataOld = this.__dataOld || {};
              this.__data[prop] = this.__dataPending[prop] = props[prop];
            }
          }
        }

        // Prototype setup ----------------------------------------

        /**
         * Equivalent to static `addPropertyEffect` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property that should trigger the effect
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object
         * @return {void}
         * @protected
         */
        _addPropertyEffect(property, type, effect) {
          this._createPropertyAccessor(property, type == TYPES.READ_ONLY);
          // effects are accumulated into arrays per property based on type
          let effects = ensureOwnEffectMap(this, type)[property];
          if (!effects) {
            effects = this[type][property] = [];
          }
          effects.push(effect);
        }

        /**
         * Removes the given property effect.
         *
         * @param {string} property Property the effect was associated with
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object to remove
         * @return {void}
         */
        _removePropertyEffect(property, type, effect) {
          let effects = ensureOwnEffectMap(this, type)[property];
          let idx = effects.indexOf(effect);
          if (idx >= 0) {
            effects.splice(idx, 1);
          }
        }

        /**
         * Returns whether the current prototype/instance has a property effect
         * of a certain type.
         *
         * @param {string} property Property name
         * @param {string=} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */
        _hasPropertyEffect(property, type) {
          let effects = this[type];
          return Boolean(effects && effects[property]);
        }

        /**
         * Returns whether the current prototype/instance has a "read only"
         * accessor for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */
        _hasReadOnlyEffect(property) {
          return this._hasPropertyEffect(property, TYPES.READ_ONLY);
        }

        /**
         * Returns whether the current prototype/instance has a "notify"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */
        _hasNotifyEffect(property) {
          return this._hasPropertyEffect(property, TYPES.NOTIFY);
        }

        /**
         * Returns whether the current prototype/instance has a "reflect to attribute"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */
        _hasReflectEffect(property) {
          return this._hasPropertyEffect(property, TYPES.REFLECT);
        }

        /**
         * Returns whether the current prototype/instance has a "computed"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */
        _hasComputedEffect(property) {
          return this._hasPropertyEffect(property, TYPES.COMPUTE);
        }

        // Runtime ----------------------------------------

        /**
         * Sets a pending property or path.  If the root property of the path in
         * question had no accessor, the path is set, otherwise it is enqueued
         * via `_setPendingProperty`.
         *
         * This function isolates relatively expensive functionality necessary
         * for the public API (`set`, `setProperties`, `notifyPath`, and property
         * change listeners via {{...}} bindings), such that it is only done
         * when paths enter the system, and not at every propagation step.  It
         * also sets a `__dataHasPaths` flag on the instance which is used to
         * fast-path slower path-matching code in the property effects host paths.
         *
         * `path` can be a path string or array of path parts as accepted by the
         * public API.
         *
         * @param {string | !Array<number|string>} path Path to set
         * @param {*} value Value to set
         * @param {boolean=} shouldNotify Set to true if this change should
         *  cause a property notification event dispatch
         * @param {boolean=} isPathNotification If the path being set is a path
         *   notification of an already changed value, as opposed to a request
         *   to set and notify the change.  In the latter `false` case, a dirty
         *   check is performed and then the value is set to the path before
         *   enqueuing the pending property change.
         * @return {boolean} Returns true if the property/path was enqueued in
         *   the pending changes bag.
         * @protected
         */
        _setPendingPropertyOrPath(path, value, shouldNotify, isPathNotification) {
          if (isPathNotification ||
              root(Array.isArray(path) ? path[0] : path) !== path) {
            // Dirty check changes being set to a path against the actual object,
            // since this is the entry point for paths into the system; from here
            // the only dirty checks are against the `__dataTemp` cache to prevent
            // duplicate work in the same turn only. Note, if this was a notification
            // of a change already set to a path (isPathNotification: true),
            // we always let the change through and skip the `set` since it was
            // already dirty checked at the point of entry and the underlying
            // object has already been updated
            if (!isPathNotification) {
              let old = get(this, path);
              path = /** @type {string} */ (set(this, path, value));
              // Use property-accessor's simpler dirty check
              if (!path || !super._shouldPropertyChange(path, value, old)) {
                return false;
              }
            }
            this.__dataHasPaths = true;
            if (this._setPendingProperty(/**@type{string}*/(path), value, shouldNotify)) {
              computeLinkedPaths(this, path, value);
              return true;
            }
          } else {
            if (this.__dataHasAccessor && this.__dataHasAccessor[path]) {
              return this._setPendingProperty(/**@type{string}*/(path), value, shouldNotify);
            } else {
              this[path] = value;
            }
          }
          return false;
        }

        /**
         * Applies a value to a non-Polymer element/node's property.
         *
         * The implementation makes a best-effort at binding interop:
         * Some native element properties have side-effects when
         * re-setting the same value (e.g. setting `<input>.value` resets the
         * cursor position), so we do a dirty-check before setting the value.
         * However, for better interop with non-Polymer custom elements that
         * accept objects, we explicitly re-set object changes coming from the
         * Polymer world (which may include deep object changes without the
         * top reference changing), erring on the side of providing more
         * information.
         *
         * Users may override this method to provide alternate approaches.
         *
         * @param {!Node} node The node to set a property on
         * @param {string} prop The property to set
         * @param {*} value The value to set
         * @return {void}
         * @protected
         */
        _setUnmanagedPropertyToNode(node, prop, value) {
          // It is a judgment call that resetting primitives is
          // "bad" and resettings objects is also "good"; alternatively we could
          // implement a whitelist of tag & property values that should never
          // be reset (e.g. <input>.value && <select>.value)
          if (value !== node[prop] || typeof value == 'object') {
            node[prop] = value;
          }
        }

        /**
         * Overrides the `PropertiesChanged` implementation to introduce special
         * dirty check logic depending on the property & value being set:
         *
         * 1. Any value set to a path (e.g. 'obj.prop': 42 or 'obj.prop': {...})
         *    Stored in `__dataTemp`, dirty checked against `__dataTemp`
         * 2. Object set to simple property (e.g. 'prop': {...})
         *    Stored in `__dataTemp` and `__data`, dirty checked against
         *    `__dataTemp` by default implementation of `_shouldPropertyChange`
         * 3. Primitive value set to simple property (e.g. 'prop': 42)
         *    Stored in `__data`, dirty checked against `__data`
         *
         * The dirty-check is important to prevent cycles due to two-way
         * notification, but paths and objects are only dirty checked against any
         * previous value set during this turn via a "temporary cache" that is
         * cleared when the last `_propertiesChanged` exits. This is so:
         * a. any cached array paths (e.g. 'array.3.prop') may be invalidated
         *    due to array mutations like shift/unshift/splice; this is fine
         *    since path changes are dirty-checked at user entry points like `set`
         * b. dirty-checking for objects only lasts one turn to allow the user
         *    to mutate the object in-place and re-set it with the same identity
         *    and have all sub-properties re-propagated in a subsequent turn.
         *
         * The temp cache is not necessarily sufficient to prevent invalid array
         * paths, since a splice can happen during the same turn (with pathological
         * user code); we could introduce a "fixup" for temporarily cached array
         * paths if needed: https://github.com/Polymer/polymer/issues/4227
         *
         * @override
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @param {boolean=} shouldNotify True if property should fire notification
         *   event (applies only for `notify: true` properties)
         * @return {boolean} Returns true if the property changed
         */
        _setPendingProperty(property, value, shouldNotify) {
          let isPath$$1 = this.__dataHasPaths && isPath(property);
          let prevProps = isPath$$1 ? this.__dataTemp : this.__data;
          if (this._shouldPropertyChange(property, value, prevProps[property])) {
            if (!this.__dataPending) {
              this.__dataPending = {};
              this.__dataOld = {};
            }
            // Ensure old is captured from the last turn
            if (!(property in this.__dataOld)) {
              this.__dataOld[property] = this.__data[property];
            }
            // Paths are stored in temporary cache (cleared at end of turn),
            // which is used for dirty-checking, all others stored in __data
            if (isPath$$1) {
              this.__dataTemp[property] = value;
            } else {
              this.__data[property] = value;
            }
            // All changes go into pending property bag, passed to _propertiesChanged
            this.__dataPending[property] = value;
            // Track properties that should notify separately
            if (isPath$$1 || (this[TYPES.NOTIFY] && this[TYPES.NOTIFY][property])) {
              this.__dataToNotify = this.__dataToNotify || {};
              this.__dataToNotify[property] = shouldNotify;
            }
            return true;
          }
          return false;
        }

        /**
         * Overrides base implementation to ensure all accessors set `shouldNotify`
         * to true, for per-property notification tracking.
         *
         * @override
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @return {void}
         */
        _setProperty(property, value) {
          if (this._setPendingProperty(property, value, true)) {
            this._invalidateProperties();
          }
        }

        /**
         * Overrides `PropertyAccessor`'s default async queuing of
         * `_propertiesChanged`: if `__dataReady` is false (has not yet been
         * manually flushed), the function no-ops; otherwise flushes
         * `_propertiesChanged` synchronously.
         *
         * @override
         * @return {void}
         */
        _invalidateProperties() {
          if (this.__dataReady) {
            this._flushProperties();
          }
        }

        /**
         * Enqueues the given client on a list of pending clients, whose
         * pending property changes can later be flushed via a call to
         * `_flushClients`.
         *
         * @param {Object} client PropertyEffects client to enqueue
         * @return {void}
         * @protected
         */
        _enqueueClient(client) {
          this.__dataPendingClients = this.__dataPendingClients || [];
          if (client !== this) {
            this.__dataPendingClients.push(client);
          }
        }

        /**
         * Overrides superclass implementation.
         *
         * @return {void}
         * @protected
         */
        _flushProperties() {
          this.__dataCounter++;
          super._flushProperties();
          this.__dataCounter--;
        }

        /**
         * Flushes any clients previously enqueued via `_enqueueClient`, causing
         * their `_flushProperties` method to run.
         *
         * @return {void}
         * @protected
         */
        _flushClients() {
          if (!this.__dataClientsReady) {
            this.__dataClientsReady = true;
            this._readyClients();
            // Override point where accessors are turned on; importantly,
            // this is after clients have fully readied, providing a guarantee
            // that any property effects occur only after all clients are ready.
            this.__dataReady = true;
          } else {
            this.__enableOrFlushClients();
          }
        }

        // NOTE: We ensure clients either enable or flush as appropriate. This
        // handles two corner cases:
        // (1) clients flush properly when connected/enabled before the host
        // enables; e.g.
        //   (a) Templatize stamps with no properties and does not flush and
        //   (b) the instance is inserted into dom and
        //   (c) then the instance flushes.
        // (2) clients enable properly when not connected/enabled when the host
        // flushes; e.g.
        //   (a) a template is runtime stamped and not yet connected/enabled
        //   (b) a host sets a property, causing stamped dom to flush
        //   (c) the stamped dom enables.
        __enableOrFlushClients() {
          let clients = this.__dataPendingClients;
          if (clients) {
            this.__dataPendingClients = null;
            for (let i=0; i < clients.length; i++) {
              let client = clients[i];
              if (!client.__dataEnabled) {
                client._enableProperties();
              } else if (client.__dataPending) {
                client._flushProperties();
              }
            }
          }
        }

        /**
         * Perform any initial setup on client dom. Called before the first
         * `_flushProperties` call on client dom and before any element
         * observers are called.
         *
         * @return {void}
         * @protected
         */
        _readyClients() {
          this.__enableOrFlushClients();
        }

        /**
         * Sets a bag of property changes to this instance, and
         * synchronously processes all effects of the properties as a batch.
         *
         * Property names must be simple properties, not paths.  Batched
         * path propagation is not supported.
         *
         * @param {Object} props Bag of one or more key-value pairs whose key is
         *   a property and value is the new value to set for that property.
         * @param {boolean=} setReadOnly When true, any private values set in
         *   `props` will be set. By default, `setProperties` will not set
         *   `readOnly: true` root properties.
         * @return {void}
         * @public
         */
        setProperties(props, setReadOnly) {
          for (let path in props) {
            if (setReadOnly || !this[TYPES.READ_ONLY] || !this[TYPES.READ_ONLY][path]) {
              //TODO(kschaaf): explicitly disallow paths in setProperty?
              // wildcard observers currently only pass the first changed path
              // in the `info` object, and you could do some odd things batching
              // paths, e.g. {'foo.bar': {...}, 'foo': null}
              this._setPendingPropertyOrPath(path, props[path], true);
            }
          }
          this._invalidateProperties();
        }

        /**
         * Overrides `PropertyAccessors` so that property accessor
         * side effects are not enabled until after client dom is fully ready.
         * Also calls `_flushClients` callback to ensure client dom is enabled
         * that was not enabled as a result of flushing properties.
         *
         * @override
         * @return {void}
         */
        ready() {
          // It is important that `super.ready()` is not called here as it
          // immediately turns on accessors. Instead, we wait until `readyClients`
          // to enable accessors to provide a guarantee that clients are ready
          // before processing any accessors side effects.
          this._flushProperties();
          // If no data was pending, `_flushProperties` will not `flushClients`
          // so ensure this is done.
          if (!this.__dataClientsReady) {
            this._flushClients();
          }
          // Before ready, client notifications do not trigger _flushProperties.
          // Therefore a flush is necessary here if data has been set.
          if (this.__dataPending) {
            this._flushProperties();
          }
        }

        /**
         * Implements `PropertyAccessors`'s properties changed callback.
         *
         * Runs each class of effects for the batch of changed properties in
         * a specific order (compute, propagate, reflect, observe, notify).
         *
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {?Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {?Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {void}
         */
        _propertiesChanged(currentProps, changedProps, oldProps) {
          // ----------------------------
          // let c = Object.getOwnPropertyNames(changedProps || {});
          // window.debug && console.group(this.localName + '#' + this.id + ': ' + c);
          // if (window.debug) { debugger; }
          // ----------------------------
          let hasPaths = this.__dataHasPaths;
          this.__dataHasPaths = false;
          // Compute properties
          runComputedEffects(this, changedProps, oldProps, hasPaths);
          // Clear notify properties prior to possible reentry (propagate, observe),
          // but after computing effects have a chance to add to them
          let notifyProps = this.__dataToNotify;
          this.__dataToNotify = null;
          // Propagate properties to clients
          this._propagatePropertyChanges(changedProps, oldProps, hasPaths);
          // Flush clients
          this._flushClients();
          // Reflect properties
          runEffects(this, this[TYPES.REFLECT], changedProps, oldProps, hasPaths);
          // Observe properties
          runEffects(this, this[TYPES.OBSERVE], changedProps, oldProps, hasPaths);
          // Notify properties to host
          if (notifyProps) {
            runNotifyEffects(this, notifyProps, changedProps, oldProps, hasPaths);
          }
          // Clear temporary cache at end of turn
          if (this.__dataCounter == 1) {
            this.__dataTemp = {};
          }
          // ----------------------------
          // window.debug && console.groupEnd(this.localName + '#' + this.id + ': ' + c);
          // ----------------------------
        }

        /**
         * Called to propagate any property changes to stamped template nodes
         * managed by this element.
         *
         * @param {Object} changedProps Bag of changed properties
         * @param {Object} oldProps Bag of previous values for changed properties
         * @param {boolean} hasPaths True with `props` contains one or more paths
         * @return {void}
         * @protected
         */
        _propagatePropertyChanges(changedProps, oldProps, hasPaths) {
          if (this[TYPES.PROPAGATE]) {
            runEffects(this, this[TYPES.PROPAGATE], changedProps, oldProps, hasPaths);
          }
          let templateInfo = this.__templateInfo;
          while (templateInfo) {
            runEffects(this, templateInfo.propertyEffects, changedProps, oldProps,
              hasPaths, templateInfo.nodeList);
            templateInfo = templateInfo.nextTemplateInfo;
          }
        }

        /**
         * Aliases one data path as another, such that path notifications from one
         * are routed to the other.
         *
         * @param {string | !Array<string|number>} to Target path to link.
         * @param {string | !Array<string|number>} from Source path to link.
         * @return {void}
         * @public
         */
        linkPaths(to, from) {
          to = normalize(to);
          from = normalize(from);
          this.__dataLinkedPaths = this.__dataLinkedPaths || {};
          this.__dataLinkedPaths[to] = from;
        }

        /**
         * Removes a data path alias previously established with `_linkPaths`.
         *
         * Note, the path to unlink should be the target (`to`) used when
         * linking the paths.
         *
         * @param {string | !Array<string|number>} path Target path to unlink.
         * @return {void}
         * @public
         */
        unlinkPaths(path) {
          path = normalize(path);
          if (this.__dataLinkedPaths) {
            delete this.__dataLinkedPaths[path];
          }
        }

        /**
         * Notify that an array has changed.
         *
         * Example:
         *
         *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
         *     ...
         *     this.items.splice(1, 1, {name: 'Sam'});
         *     this.items.push({name: 'Bob'});
         *     this.notifySplices('items', [
         *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1, object: this.items, type: 'splice' },
         *       { index: 3, removed: [], addedCount: 1, object: this.items, type: 'splice'}
         *     ]);
         *
         * @param {string} path Path that should be notified.
         * @param {Array} splices Array of splice records indicating ordered
         *   changes that occurred to the array. Each record should have the
         *   following fields:
         *    * index: index at which the change occurred
         *    * removed: array of items that were removed from this index
         *    * addedCount: number of new items added at this index
         *    * object: a reference to the array in question
         *    * type: the string literal 'splice'
         *
         *   Note that splice records _must_ be normalized such that they are
         *   reported in index order (raw results from `Object.observe` are not
         *   ordered and must be normalized/merged before notifying).
         * @return {void}
         * @public
        */
        notifySplices(path, splices) {
          let info = {path: ''};
          let array = /** @type {Array} */(get(this, path, info));
          notifySplices(this, array, info.path, splices);
        }

        /**
         * Convenience method for reading a value from a path.
         *
         * Note, if any part in the path is undefined, this method returns
         * `undefined` (this method does not throw when dereferencing undefined
         * paths).
         *
         * @param {(string|!Array<(string|number)>)} path Path to the value
         *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
         *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
         *   bracketed expressions are not supported; string-based path parts
         *   *must* be separated by dots.  Note that when dereferencing array
         *   indices, the index may be used as a dotted part directly
         *   (e.g. `users.12.name` or `['users', 12, 'name']`).
         * @param {Object=} root Root object from which the path is evaluated.
         * @return {*} Value at the path, or `undefined` if any part of the path
         *   is undefined.
         * @public
         */
        get(path, root$$1) {
          return get(root$$1 || this, path);
        }

        /**
         * Convenience method for setting a value to a path and notifying any
         * elements bound to the same path.
         *
         * Note, if any part in the path except for the last is undefined,
         * this method does nothing (this method does not throw when
         * dereferencing undefined paths).
         *
         * @param {(string|!Array<(string|number)>)} path Path to the value
         *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
         *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
         *   bracketed expressions are not supported; string-based path parts
         *   *must* be separated by dots.  Note that when dereferencing array
         *   indices, the index may be used as a dotted part directly
         *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
         * @param {*} value Value to set at the specified path.
         * @param {Object=} root Root object from which the path is evaluated.
         *   When specified, no notification will occur.
         * @return {void}
         * @public
        */
        set(path, value, root$$1) {
          if (root$$1) {
            set(root$$1, path, value);
          } else {
            if (!this[TYPES.READ_ONLY] || !this[TYPES.READ_ONLY][/** @type {string} */(path)]) {
              if (this._setPendingPropertyOrPath(path, value, true)) {
                this._invalidateProperties();
              }
            }
          }
        }

        /**
         * Adds items onto the end of the array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.push`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @param {...*} items Items to push onto array
         * @return {number} New length of the array.
         * @public
         */
        push(path, ...items) {
          let info = {path: ''};
          let array = /** @type {Array}*/(get(this, path, info));
          let len = array.length;
          let ret = array.push(...items);
          if (items.length) {
            notifySplice(this, array, info.path, len, items.length, []);
          }
          return ret;
        }

        /**
         * Removes an item from the end of array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.pop`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @return {*} Item that was removed.
         * @public
         */
        pop(path) {
          let info = {path: ''};
          let array = /** @type {Array} */(get(this, path, info));
          let hadLength = Boolean(array.length);
          let ret = array.pop();
          if (hadLength) {
            notifySplice(this, array, info.path, array.length, 0, [ret]);
          }
          return ret;
        }

        /**
         * Starting from the start index specified, removes 0 or more items
         * from the array and inserts 0 or more new items in their place.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.splice`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @param {number} start Index from which to start removing/inserting.
         * @param {number} deleteCount Number of items to remove.
         * @param {...*} items Items to insert into array.
         * @return {Array} Array of removed items.
         * @public
         */
        splice(path, start, deleteCount, ...items) {
          let info = {path : ''};
          let array = /** @type {Array} */(get(this, path, info));
          // Normalize fancy native splice handling of crazy start values
          if (start < 0) {
            start = array.length - Math.floor(-start);
          } else if (start) {
            start = Math.floor(start);
          }
          // array.splice does different things based on the number of arguments
          // you pass in. Therefore, array.splice(0) and array.splice(0, undefined)
          // do different things. In the former, the whole array is cleared. In the
          // latter, no items are removed.
          // This means that we need to detect whether 1. one of the arguments
          // is actually passed in and then 2. determine how many arguments
          // we should pass on to the native array.splice
          //
          let ret;
          // Omit any additional arguments if they were not passed in
          if (arguments.length === 2) {
            ret = array.splice(start);
          // Either start was undefined and the others were defined, but in this
          // case we can safely pass on all arguments
          //
          // Note: this includes the case where none of the arguments were passed in,
          // e.g. this.splice('array'). However, if both start and deleteCount
          // are undefined, array.splice will not modify the array (as expected)
          } else {
            ret = array.splice(start, deleteCount, ...items);
          }
          // At the end, check whether any items were passed in (e.g. insertions)
          // or if the return array contains items (e.g. deletions).
          // Only notify if items were added or deleted.
          if (items.length || ret.length) {
            notifySplice(this, array, info.path, start, items.length, ret);
          }
          return ret;
        }

        /**
         * Removes an item from the beginning of array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.pop`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @return {*} Item that was removed.
         * @public
         */
        shift(path) {
          let info = {path: ''};
          let array = /** @type {Array} */(get(this, path, info));
          let hadLength = Boolean(array.length);
          let ret = array.shift();
          if (hadLength) {
            notifySplice(this, array, info.path, 0, 0, [ret]);
          }
          return ret;
        }

        /**
         * Adds items onto the beginning of the array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.push`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @param {string | !Array<string|number>} path Path to array.
         * @param {...*} items Items to insert info array
         * @return {number} New length of the array.
         * @public
         */
        unshift(path, ...items) {
          let info = {path: ''};
          let array = /** @type {Array} */(get(this, path, info));
          let ret = array.unshift(...items);
          if (items.length) {
            notifySplice(this, array, info.path, 0, items.length, []);
          }
          return ret;
        }

        /**
         * Notify that a path has changed.
         *
         * Example:
         *
         *     this.item.user.name = 'Bob';
         *     this.notifyPath('item.user.name');
         *
         * @param {string} path Path that should be notified.
         * @param {*=} value Value at the path (optional).
         * @return {void}
         * @public
        */
        notifyPath(path, value) {
          /** @type {string} */
          let propPath;
          if (arguments.length == 1) {
            // Get value if not supplied
            let info = {path: ''};
            value = get(this, path, info);
            propPath = info.path;
          } else if (Array.isArray(path)) {
            // Normalize path if needed
            propPath = normalize(path);
          } else {
            propPath = /** @type{string} */(path);
          }
          if (this._setPendingPropertyOrPath(propPath, value, true, true)) {
            this._invalidateProperties();
          }
        }

        /**
         * Equivalent to static `createReadOnlyProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @param {boolean=} protectedSetter Creates a custom protected setter
         *   when `true`.
         * @return {void}
         * @protected
         */
        _createReadOnlyProperty(property, protectedSetter) {
          this._addPropertyEffect(property, TYPES.READ_ONLY);
          if (protectedSetter) {
            this['_set' + upper(property)] = /** @this {PropertyEffects} */function(value) {
              this._setProperty(property, value);
            };
          }
        }

        /**
         * Equivalent to static `createPropertyObserver` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @param {string|function(*,*)} method Function or name of observer method to call
         * @param {boolean=} dynamicFn Whether the method name should be included as
         *   a dependency to the effect.
         * @return {void}
         * @protected
         */
        _createPropertyObserver(property, method, dynamicFn) {
          let info = { property, method, dynamicFn: Boolean(dynamicFn) };
          this._addPropertyEffect(property, TYPES.OBSERVE, {
            fn: runObserverEffect, info, trigger: {name: property}
          });
          if (dynamicFn) {
            this._addPropertyEffect(/** @type {string} */(method), TYPES.OBSERVE, {
              fn: runObserverEffect, info, trigger: {name: method}
            });
          }
        }

        /**
         * Equivalent to static `createMethodObserver` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating
         *   whether method names should be included as a dependency to the effect.
         * @return {void}
         * @protected
         */
        _createMethodObserver(expression, dynamicFn) {
          let sig = parseMethod(expression);
          if (!sig) {
            throw new Error("Malformed observer expression '" + expression + "'");
          }
          createMethodEffect(this, sig, TYPES.OBSERVE, runMethodEffect, null, dynamicFn);
        }

        /**
         * Equivalent to static `createNotifyingProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */
        _createNotifyingProperty(property) {
          this._addPropertyEffect(property, TYPES.NOTIFY, {
            fn: runNotifyEffect,
            info: {
              eventName: CaseMap.camelToDashCase(property) + '-changed',
              property: property
            }
          });
        }

        /**
         * Equivalent to static `createReflectedProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */
        _createReflectedProperty(property) {
          let attr = this.constructor.attributeNameForProperty(property);
          if (attr[0] === '-') {
            console.warn('Property ' + property + ' cannot be reflected to attribute ' +
              attr + ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.');
          } else {
            this._addPropertyEffect(property, TYPES.REFLECT, {
              fn: runReflectEffect,
              info: {
                attrName: attr
              }
            });
          }
        }

        /**
         * Equivalent to static `createComputedProperty` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * @param {string} property Name of computed property to set
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating
         *   whether method names should be included as a dependency to the effect.
         * @return {void}
         * @protected
         */
        _createComputedProperty(property, expression, dynamicFn) {
          let sig = parseMethod(expression);
          if (!sig) {
            throw new Error("Malformed computed expression '" + expression + "'");
          }
          createMethodEffect(this, sig, TYPES.COMPUTE, runComputedEffect, property, dynamicFn);
        }

        // -- static class methods ------------

        /**
         * Ensures an accessor exists for the specified property, and adds
         * to a list of "property effects" that will run when the accessor for
         * the specified property is set.  Effects are grouped by "type", which
         * roughly corresponds to a phase in effect processing.  The effect
         * metadata should be in the following form:
         *
         *     {
         *       fn: effectFunction, // Reference to function to call to perform effect
         *       info: { ... }       // Effect metadata passed to function
         *       trigger: {          // Optional triggering metadata; if not provided
         *         name: string      // the property is treated as a wildcard
         *         structured: boolean
         *         wildcard: boolean
         *       }
         *     }
         *
         * Effects are called from `_propertiesChanged` in the following order by
         * type:
         *
         * 1. COMPUTE
         * 2. PROPAGATE
         * 3. REFLECT
         * 4. OBSERVE
         * 5. NOTIFY
         *
         * Effect functions are called with the following signature:
         *
         *     effectFunction(inst, path, props, oldProps, info, hasPaths)
         *
         * @param {string} property Property that should trigger the effect
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object
         * @return {void}
         * @protected
         */
        static addPropertyEffect(property, type, effect) {
          this.prototype._addPropertyEffect(property, type, effect);
        }

        /**
         * Creates a single-property observer for the given property.
         *
         * @param {string} property Property name
         * @param {string|function(*,*)} method Function or name of observer method to call
         * @param {boolean=} dynamicFn Whether the method name should be included as
         *   a dependency to the effect.
         * @return {void}
         * @protected
         */
        static createPropertyObserver(property, method, dynamicFn) {
          this.prototype._createPropertyObserver(property, method, dynamicFn);
        }

        /**
         * Creates a multi-property "method observer" based on the provided
         * expression, which should be a string in the form of a normal JavaScript
         * function signature: `'methodName(arg1, [..., argn])'`.  Each argument
         * should correspond to a property or path in the context of this
         * prototype (or instance), or may be a literal string or number.
         *
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating
         * @return {void}
         *   whether method names should be included as a dependency to the effect.
         * @protected
         */
        static createMethodObserver(expression, dynamicFn) {
          this.prototype._createMethodObserver(expression, dynamicFn);
        }

        /**
         * Causes the setter for the given property to dispatch `<property>-changed`
         * events to notify of changes to the property.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */
        static createNotifyingProperty(property) {
          this.prototype._createNotifyingProperty(property);
        }

        /**
         * Creates a read-only accessor for the given property.
         *
         * To set the property, use the protected `_setProperty` API.
         * To create a custom protected setter (e.g. `_setMyProp()` for
         * property `myProp`), pass `true` for `protectedSetter`.
         *
         * Note, if the property will have other property effects, this method
         * should be called first, before adding other effects.
         *
         * @param {string} property Property name
         * @param {boolean=} protectedSetter Creates a custom protected setter
         *   when `true`.
         * @return {void}
         * @protected
         */
        static createReadOnlyProperty(property, protectedSetter) {
          this.prototype._createReadOnlyProperty(property, protectedSetter);
        }

        /**
         * Causes the setter for the given property to reflect the property value
         * to a (dash-cased) attribute of the same name.
         *
         * @param {string} property Property name
         * @return {void}
         * @protected
         */
        static createReflectedProperty(property) {
          this.prototype._createReflectedProperty(property);
        }

        /**
         * Creates a computed property whose value is set to the result of the
         * method described by the given `expression` each time one or more
         * arguments to the method changes.  The expression should be a string
         * in the form of a normal JavaScript function signature:
         * `'methodName(arg1, [..., argn])'`
         *
         * @param {string} property Name of computed property to set
         * @param {string} expression Method expression
         * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
         *   method names should be included as a dependency to the effect.
         * @return {void}
         * @protected
         */
        static createComputedProperty(property, expression, dynamicFn) {
          this.prototype._createComputedProperty(property, expression, dynamicFn);
        }

        /**
         * Parses the provided template to ensure binding effects are created
         * for them, and then ensures property accessors are created for any
         * dependent properties in the template.  Binding effects for bound
         * templates are stored in a linked list on the instance so that
         * templates can be efficiently stamped and unstamped.
         *
         * @param {!HTMLTemplateElement} template Template containing binding
         *   bindings
         * @return {!TemplateInfo} Template metadata object
         * @protected
         */
        static bindTemplate(template) {
          return this.prototype._bindTemplate(template);
        }

        // -- binding ----------------------------------------------

        /**
         * Equivalent to static `bindTemplate` API but can be called on
         * an instance to add effects at runtime.  See that method for
         * full API docs.
         *
         * This method may be called on the prototype (for prototypical template
         * binding, to avoid creating accessors every instance) once per prototype,
         * and will be called with `runtimeBinding: true` by `_stampTemplate` to
         * create and link an instance of the template metadata associated with a
         * particular stamping.
         *
         * @param {!HTMLTemplateElement} template Template containing binding
         *   bindings
         * @param {boolean=} instanceBinding When false (default), performs
         *   "prototypical" binding of the template and overwrites any previously
         *   bound template for the class. When true (as passed from
         *   `_stampTemplate`), the template info is instanced and linked into
         *   the list of bound templates.
         * @return {!TemplateInfo} Template metadata object; for `runtimeBinding`,
         *   this is an instance of the prototypical template info
         * @protected
         */
        _bindTemplate(template, instanceBinding) {
          let templateInfo = this.constructor._parseTemplate(template);
          let wasPreBound = this.__templateInfo == templateInfo;
          // Optimization: since this is called twice for proto-bound templates,
          // don't attempt to recreate accessors if this template was pre-bound
          if (!wasPreBound) {
            for (let prop in templateInfo.propertyEffects) {
              this._createPropertyAccessor(prop);
            }
          }
          if (instanceBinding) {
            // For instance-time binding, create instance of template metadata
            // and link into list of templates if necessary
            templateInfo = /** @type {!TemplateInfo} */(Object.create(templateInfo));
            templateInfo.wasPreBound = wasPreBound;
            if (!wasPreBound && this.__templateInfo) {
              let last = this.__templateInfoLast || this.__templateInfo;
              this.__templateInfoLast = last.nextTemplateInfo = templateInfo;
              templateInfo.previousTemplateInfo = last;
              return templateInfo;
            }
          }
          return this.__templateInfo = templateInfo;
        }

        /**
         * Adds a property effect to the given template metadata, which is run
         * at the "propagate" stage of `_propertiesChanged` when the template
         * has been bound to the element via `_bindTemplate`.
         *
         * The `effect` object should match the format in `_addPropertyEffect`.
         *
         * @param {Object} templateInfo Template metadata to add effect to
         * @param {string} prop Property that should trigger the effect
         * @param {Object=} effect Effect metadata object
         * @return {void}
         * @protected
         */
        static _addTemplatePropertyEffect(templateInfo, prop, effect) {
          let hostProps = templateInfo.hostProps = templateInfo.hostProps || {};
          hostProps[prop] = true;
          let effects = templateInfo.propertyEffects = templateInfo.propertyEffects || {};
          let propEffects = effects[prop] = effects[prop] || [];
          propEffects.push(effect);
        }

        /**
         * Stamps the provided template and performs instance-time setup for
         * Polymer template features, including data bindings, declarative event
         * listeners, and the `this.$` map of `id`'s to nodes.  A document fragment
         * is returned containing the stamped DOM, ready for insertion into the
         * DOM.
         *
         * This method may be called more than once; however note that due to
         * `shadycss` polyfill limitations, only styles from templates prepared
         * using `ShadyCSS.prepareTemplate` will be correctly polyfilled (scoped
         * to the shadow root and support CSS custom properties), and note that
         * `ShadyCSS.prepareTemplate` may only be called once per element. As such,
         * any styles required by in runtime-stamped templates must be included
         * in the main element template.
         *
         * @param {!HTMLTemplateElement} template Template to stamp
         * @return {!StampedTemplate} Cloned template content
         * @override
         * @protected
         */
        _stampTemplate(template) {
          // Ensures that created dom is `_enqueueClient`'d to this element so
          // that it can be flushed on next call to `_flushProperties`
          hostStack.beginHosting(this);
          let dom = super._stampTemplate(template);
          hostStack.endHosting(this);
          let templateInfo = /** @type {!TemplateInfo} */(this._bindTemplate(template, true));
          // Add template-instance-specific data to instanced templateInfo
          templateInfo.nodeList = dom.nodeList;
          // Capture child nodes to allow unstamping of non-prototypical templates
          if (!templateInfo.wasPreBound) {
            let nodes = templateInfo.childNodes = [];
            for (let n=dom.firstChild; n; n=n.nextSibling) {
              nodes.push(n);
            }
          }
          dom.templateInfo = templateInfo;
          // Setup compound storage, 2-way listeners, and dataHost for bindings
          setupBindings(this, templateInfo);
          // Flush properties into template nodes if already booted
          if (this.__dataReady) {
            runEffects(this, templateInfo.propertyEffects, this.__data, null,
              false, templateInfo.nodeList);
          }
          return dom;
        }

        /**
         * Removes and unbinds the nodes previously contained in the provided
         * DocumentFragment returned from `_stampTemplate`.
         *
         * @param {!StampedTemplate} dom DocumentFragment previously returned
         *   from `_stampTemplate` associated with the nodes to be removed
         * @return {void}
         * @protected
         */
        _removeBoundDom(dom) {
          // Unlink template info
          let templateInfo = dom.templateInfo;
          if (templateInfo.previousTemplateInfo) {
            templateInfo.previousTemplateInfo.nextTemplateInfo =
              templateInfo.nextTemplateInfo;
          }
          if (templateInfo.nextTemplateInfo) {
            templateInfo.nextTemplateInfo.previousTemplateInfo =
              templateInfo.previousTemplateInfo;
          }
          if (this.__templateInfoLast == templateInfo) {
            this.__templateInfoLast = templateInfo.previousTemplateInfo;
          }
          templateInfo.previousTemplateInfo = templateInfo.nextTemplateInfo = null;
          // Remove stamped nodes
          let nodes = templateInfo.childNodes;
          for (let i=0; i<nodes.length; i++) {
            let node = nodes[i];
            node.parentNode.removeChild(node);
          }
        }

        /**
         * Overrides default `TemplateStamp` implementation to add support for
         * parsing bindings from `TextNode`'s' `textContent`.  A `bindings`
         * array is added to `nodeInfo` and populated with binding metadata
         * with information capturing the binding target, and a `parts` array
         * with one or more metadata objects capturing the source(s) of the
         * binding.
         *
         * @override
         * @param {Node} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template node
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @protected
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        static _parseTemplateNode(node, templateInfo, nodeInfo) {
          let noted = super._parseTemplateNode(node, templateInfo, nodeInfo);
          if (node.nodeType === Node.TEXT_NODE) {
            let parts = this._parseBindings(node.textContent, templateInfo);
            if (parts) {
              // Initialize the textContent with any literal parts
              // NOTE: default to a space here so the textNode remains; some browsers
              // (IE) omit an empty textNode following cloneNode/importNode.
              node.textContent = literalFromParts(parts) || ' ';
              addBinding(this, templateInfo, nodeInfo, 'text', 'textContent', parts);
              noted = true;
            }
          }
          return noted;
        }

        /**
         * Overrides default `TemplateStamp` implementation to add support for
         * parsing bindings from attributes.  A `bindings`
         * array is added to `nodeInfo` and populated with binding metadata
         * with information capturing the binding target, and a `parts` array
         * with one or more metadata objects capturing the source(s) of the
         * binding.
         *
         * @override
         * @param {Element} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template node
         * @param {string} name Attribute name
         * @param {string} value Attribute value
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @protected
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        static _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
          let parts = this._parseBindings(value, templateInfo);
          if (parts) {
            // Attribute or property
            let origName = name;
            let kind = 'property';
            // The only way we see a capital letter here is if the attr has
            // a capital letter in it per spec. In this case, to make sure
            // this binding works, we go ahead and make the binding to the attribute.
            if (capitalAttributeRegex.test(name)) {
              kind = 'attribute';
            } else if (name[name.length-1] == '$') {
              name = name.slice(0, -1);
              kind = 'attribute';
            }
            // Initialize attribute bindings with any literal parts
            let literal = literalFromParts(parts);
            if (literal && kind == 'attribute') {
              node.setAttribute(name, literal);
            }
            // Clear attribute before removing, since IE won't allow removing
            // `value` attribute if it previously had a value (can't
            // unconditionally set '' before removing since attributes with `$`
            // can't be set using setAttribute)
            if (node.localName === 'input' && origName === 'value') {
              node.setAttribute(origName, '');
            }
            // Remove annotation
            node.removeAttribute(origName);
            // Case hackery: attributes are lower-case, but bind targets
            // (properties) are case sensitive. Gambit is to map dash-case to
            // camel-case: `foo-bar` becomes `fooBar`.
            // Attribute bindings are excepted.
            if (kind === 'property') {
              name = dashToCamelCase(name);
            }
            addBinding(this, templateInfo, nodeInfo, kind, name, parts, literal);
            return true;
          } else {
            return super._parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value);
          }
        }

        /**
         * Overrides default `TemplateStamp` implementation to add support for
         * binding the properties that a nested template depends on to the template
         * as `_host_<property>`.
         *
         * @override
         * @param {Node} node Node to parse
         * @param {TemplateInfo} templateInfo Template metadata for current template
         * @param {NodeInfo} nodeInfo Node metadata for current template node
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @protected
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        static _parseTemplateNestedTemplate(node, templateInfo, nodeInfo) {
          let noted = super._parseTemplateNestedTemplate(node, templateInfo, nodeInfo);
          // Merge host props into outer template and add bindings
          let hostProps = nodeInfo.templateInfo.hostProps;
          let mode = '{';
          for (let source in hostProps) {
            let parts = [{ mode, source, dependencies: [source] }];
            addBinding(this, templateInfo, nodeInfo, 'property', '_host_' + source, parts);
          }
          return noted;
        }

        /**
         * Called to parse text in a template (either attribute values or
         * textContent) into binding metadata.
         *
         * Any overrides of this method should return an array of binding part
         * metadata  representing one or more bindings found in the provided text
         * and any "literal" text in between.  Any non-literal parts will be passed
         * to `_evaluateBinding` when any dependencies change.  The only required
         * fields of each "part" in the returned array are as follows:
         *
         * - `dependencies` - Array containing trigger metadata for each property
         *   that should trigger the binding to update
         * - `literal` - String containing text if the part represents a literal;
         *   in this case no `dependencies` are needed
         *
         * Additional metadata for use by `_evaluateBinding` may be provided in
         * each part object as needed.
         *
         * The default implementation handles the following types of bindings
         * (one or more may be intermixed with literal strings):
         * - Property binding: `[[prop]]`
         * - Path binding: `[[object.prop]]`
         * - Negated property or path bindings: `[[!prop]]` or `[[!object.prop]]`
         * - Two-way property or path bindings (supports negation):
         *   `{{prop}}`, `{{object.prop}}`, `{{!prop}}` or `{{!object.prop}}`
         * - Inline computed method (supports negation):
         *   `[[compute(a, 'literal', b)]]`, `[[!compute(a, 'literal', b)]]`
         *
         * The default implementation uses a regular expression for best
         * performance. However, the regular expression uses a white-list of
         * allowed characters in a data-binding, which causes problems for
         * data-bindings that do use characters not in this white-list.
         *
         * Instead of updating the white-list with all allowed characters,
         * there is a StrictBindingParser (see lib/mixins/strict-binding-parser)
         * that uses a state machine instead. This state machine is able to handle
         * all characters. However, it is slightly less performant, therefore we
         * extracted it into a separate optional mixin.
         *
         * @param {string} text Text to parse from attribute or textContent
         * @param {Object} templateInfo Current template metadata
         * @return {Array<!BindingPart>} Array of binding part metadata
         * @protected
         */
        static _parseBindings(text, templateInfo) {
          let parts = [];
          let lastIndex = 0;
          let m;
          // Example: "literal1{{prop}}literal2[[!compute(foo,bar)]]final"
          // Regex matches:
          //        Iteration 1:  Iteration 2:
          // m[1]: '{{'          '[['
          // m[2]: ''            '!'
          // m[3]: 'prop'        'compute(foo,bar)'
          while ((m = bindingRegex.exec(text)) !== null) {
            // Add literal part
            if (m.index > lastIndex) {
              parts.push({literal: text.slice(lastIndex, m.index)});
            }
            // Add binding part
            let mode = m[1][0];
            let negate = Boolean(m[2]);
            let source = m[3].trim();
            let customEvent = false, notifyEvent = '', colon = -1;
            if (mode == '{' && (colon = source.indexOf('::')) > 0) {
              notifyEvent = source.substring(colon + 2);
              source = source.substring(0, colon);
              customEvent = true;
            }
            let signature = parseMethod(source);
            let dependencies = [];
            if (signature) {
              // Inline computed function
              let {args, methodName} = signature;
              for (let i=0; i<args.length; i++) {
                let arg = args[i];
                if (!arg.literal) {
                  dependencies.push(arg);
                }
              }
              let dynamicFns = templateInfo.dynamicFns;
              if (dynamicFns && dynamicFns[methodName] || signature.static) {
                dependencies.push(methodName);
                signature.dynamicFn = true;
              }
            } else {
              // Property or path
              dependencies.push(source);
            }
            parts.push({
              source, mode, negate, customEvent, signature, dependencies,
              event: notifyEvent
            });
            lastIndex = bindingRegex.lastIndex;
          }
          // Add a final literal part
          if (lastIndex && lastIndex < text.length) {
            let literal = text.substring(lastIndex);
            if (literal) {
              parts.push({
                literal: literal
              });
            }
          }
          if (parts.length) {
            return parts;
          } else {
            return null;
          }
        }

        /**
         * Called to evaluate a previously parsed binding part based on a set of
         * one or more changed dependencies.
         *
         * @param {this} inst Element that should be used as scope for
         *   binding dependencies
         * @param {BindingPart} part Binding part metadata
         * @param {string} path Property/path that triggered this effect
         * @param {Object} props Bag of current property changes
         * @param {Object} oldProps Bag of previous values for changed properties
         * @param {boolean} hasPaths True with `props` contains one or more paths
         * @return {*} Value the binding part evaluated to
         * @protected
         */
        static _evaluateBinding(inst, part, path, props, oldProps, hasPaths) {
          let value;
          if (part.signature) {
            value = runMethodEffect(inst, path, props, oldProps, part.signature);
          } else if (path != part.source) {
            value = get(inst, part.source);
          } else {
            if (hasPaths && isPath(path)) {
              value = get(inst, path);
            } else {
              value = inst.__data[path];
            }
          }
          if (part.negate) {
            value = !value;
          }
          return value;
        }

      }

      return PropertyEffects;
    });

    /**
     * Helper api for enqueuing client dom created by a host element.
     *
     * By default elements are flushed via `_flushProperties` when
     * `connectedCallback` is called. Elements attach their client dom to
     * themselves at `ready` time which results from this first flush.
     * This provides an ordering guarantee that the client dom an element
     * creates is flushed before the element itself (i.e. client `ready`
     * fires before host `ready`).
     *
     * However, if `_flushProperties` is called *before* an element is connected,
     * as for example `Templatize` does, this ordering guarantee cannot be
     * satisfied because no elements are connected. (Note: Bound elements that
     * receive data do become enqueued clients and are properly ordered but
     * unbound elements are not.)
     *
     * To maintain the desired "client before host" ordering guarantee for this
     * case we rely on the "host stack. Client nodes registers themselves with
     * the creating host element when created. This ensures that all client dom
     * is readied in the proper order, maintaining the desired guarantee.
     *
     * @private
     */
    class HostStack {
      constructor() {
        this.stack = [];
      }

      /**
       * @param {*} inst Instance to add to hostStack
       * @return {void}
       */
      registerHost(inst) {
        if (this.stack.length) {
          let host = this.stack[this.stack.length-1];
          host._enqueueClient(inst);
        }
      }

      /**
       * @param {*} inst Instance to begin hosting
       * @return {void}
       */
      beginHosting(inst) {
        this.stack.push(inst);
      }

      /**
       * @param {*} inst Instance to end hosting
       * @return {void}
       */
      endHosting(inst) {
        let stackLen = this.stack.length;
        if (stackLen && this.stack[stackLen-1] == inst) {
          this.stack.pop();
        }
      }
    }
    const hostStack = new HostStack();

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Creates a copy of `props` with each property normalized such that
     * upgraded it is an object with at least a type property { type: Type}.
     *
     * @param {Object} props Properties to normalize
     * @return {Object} Copy of input `props` with normalized properties that
     * are in the form {type: Type}
     * @private
     */
    function normalizeProperties(props) {
      const output = {};
      for (let p in props) {
        const o = props[p];
        output[p] = (typeof o === 'function') ? {type: o} : o;
      }
      return output;
    }

    /**
     * Mixin that provides a minimal starting point to using the PropertiesChanged
     * mixin by providing a mechanism to declare properties in a static
     * getter (e.g. static get properties() { return { foo: String } }). Changes
     * are reported via the `_propertiesChanged` method.
     *
     * This mixin provides no specific support for rendering. Users are expected
     * to create a ShadowRoot and put content into it and update it in whatever
     * way makes sense. This can be done in reaction to properties changing by
     * implementing `_propertiesChanged`.
     *
     * @mixinFunction
     * @polymer
     * @appliesMixin PropertiesChanged
     * @summary Mixin that provides a minimal starting point for using
     * the PropertiesChanged mixin by providing a declarative `properties` object.
     */
    const PropertiesMixin = dedupingMixin(superClass => {

     /**
      * @constructor
      * @implements {Polymer_PropertiesChanged}
      * @private
      */
     const base = PropertiesChanged(superClass);

     /**
      * Returns the super class constructor for the given class, if it is an
      * instance of the PropertiesMixin.
      *
      * @param {!PropertiesMixinConstructor} constructor PropertiesMixin constructor
      * @return {?PropertiesMixinConstructor} Super class constructor
      */
     function superPropertiesClass(constructor) {
       const superCtor = Object.getPrototypeOf(constructor);

       // Note, the `PropertiesMixin` class below only refers to the class
       // generated by this call to the mixin; the instanceof test only works
       // because the mixin is deduped and guaranteed only to apply once, hence
       // all constructors in a proto chain will see the same `PropertiesMixin`
       return (superCtor.prototype instanceof PropertiesMixin) ?
         /** @type {!PropertiesMixinConstructor} */ (superCtor) : null;
     }

     /**
      * Returns a memoized version of the `properties` object for the
      * given class. Properties not in object format are converted to at
      * least {type}.
      *
      * @param {PropertiesMixinConstructor} constructor PropertiesMixin constructor
      * @return {Object} Memoized properties object
      */
     function ownProperties(constructor) {
       if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownProperties', constructor))) {
         let props = null;

         if (constructor.hasOwnProperty(JSCompiler_renameProperty('properties', constructor)) && constructor.properties) {
           props = normalizeProperties(constructor.properties);
         }

         constructor.__ownProperties = props;
       }
       return constructor.__ownProperties;
     }

     /**
      * @polymer
      * @mixinClass
      * @extends {base}
      * @implements {Polymer_PropertiesMixin}
      * @unrestricted
      */
     class PropertiesMixin extends base {

       /**
        * Implements standard custom elements getter to observes the attributes
        * listed in `properties`.
        * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
        */
       static get observedAttributes() {
         const props = this._properties;
         return props ? Object.keys(props).map(p => this.attributeNameForProperty(p)) : [];
       }

       /**
        * Finalizes an element definition, including ensuring any super classes
        * are also finalized. This includes ensuring property
        * accessors exist on the element prototype. This method calls
        * `_finalizeClass` to finalize each constructor in the prototype chain.
        * @return {void}
        */
       static finalize() {
         if (!this.hasOwnProperty(JSCompiler_renameProperty('__finalized', this))) {
           const superCtor = superPropertiesClass(/** @type {!PropertiesMixinConstructor} */(this));
           if (superCtor) {
             superCtor.finalize();
           }
           this.__finalized = true;
           this._finalizeClass();
         }
       }

       /**
        * Finalize an element class. This includes ensuring property
        * accessors exist on the element prototype. This method is called by
        * `finalize` and finalizes the class constructor.
        *
        * @protected
        */
       static _finalizeClass() {
         const props = ownProperties(/** @type {!PropertiesMixinConstructor} */(this));
         if (props) {
           this.createProperties(props);
         }
       }

       /**
        * Returns a memoized version of all properties, including those inherited
        * from super classes. Properties not in object format are converted to
        * at least {type}.
        *
        * @return {Object} Object containing properties for this class
        * @protected
        */
       static get _properties() {
         if (!this.hasOwnProperty(
           JSCompiler_renameProperty('__properties', this))) {
           const superCtor = superPropertiesClass(/** @type {!PropertiesMixinConstructor} */(this));
           this.__properties = Object.assign({},
             superCtor && superCtor._properties,
             ownProperties(/** @type {PropertiesMixinConstructor} */(this)));
         }
         return this.__properties;
       }

       /**
        * Overrides `PropertiesChanged` method to return type specified in the
        * static `properties` object for the given property.
        * @param {string} name Name of property
        * @return {*} Type to which to deserialize attribute
        *
        * @protected
        */
       static typeForProperty(name) {
         const info = this._properties[name];
         return info && info.type;
       }

       /**
        * Overrides `PropertiesChanged` method and adds a call to
        * `finalize` which lazily configures the element's property accessors.
        * @override
        * @return {void}
        */
       _initializeProperties() {
         this.constructor.finalize();
         super._initializeProperties();
       }

       /**
        * Called when the element is added to a document.
        * Calls `_enableProperties` to turn on property system from
        * `PropertiesChanged`.
        * @suppress {missingProperties} Super may or may not implement the callback
        * @return {void}
        * @override
        */
       connectedCallback() {
         if (super.connectedCallback) {
           super.connectedCallback();
         }
         this._enableProperties();
       }

       /**
        * Called when the element is removed from a document
        * @suppress {missingProperties} Super may or may not implement the callback
        * @return {void}
        * @override
        */
       disconnectedCallback() {
         if (super.disconnectedCallback) {
           super.disconnectedCallback();
         }
       }

     }

     return PropertiesMixin;

    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Element class mixin that provides the core API for Polymer's meta-programming
     * features including template stamping, data-binding, attribute deserialization,
     * and property change observation.
     *
     * Subclassers may provide the following static getters to return metadata
     * used to configure Polymer's features for the class:
     *
     * - `static get is()`: When the template is provided via a `dom-module`,
     *   users should return the `dom-module` id from a static `is` getter.  If
     *   no template is needed or the template is provided directly via the
     *   `template` getter, there is no need to define `is` for the element.
     *
     * - `static get template()`: Users may provide the template directly (as
     *   opposed to via `dom-module`) by implementing a static `template` getter.
     *   The getter must return an `HTMLTemplateElement`.
     *
     * - `static get properties()`: Should return an object describing
     *   property-related metadata used by Polymer features (key: property name
     *   value: object containing property metadata). Valid keys in per-property
     *   metadata include:
     *   - `type` (String|Number|Object|Array|...): Used by
     *     `attributeChangedCallback` to determine how string-based attributes
     *     are deserialized to JavaScript property values.
     *   - `notify` (boolean): Causes a change in the property to fire a
     *     non-bubbling event called `<property>-changed`. Elements that have
     *     enabled two-way binding to the property use this event to observe changes.
     *   - `readOnly` (boolean): Creates a getter for the property, but no setter.
     *     To set a read-only property, use the private setter method
     *     `_setProperty(property, value)`.
     *   - `observer` (string): Observer method name that will be called when
     *     the property changes. The arguments of the method are
     *     `(value, previousValue)`.
     *   - `computed` (string): String describing method and dependent properties
     *     for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
     *     Computed properties are read-only by default and can only be changed
     *     via the return value of the computing method.
     *
     * - `static get observers()`: Array of strings describing multi-property
     *   observer methods and their dependent properties (e.g.
     *   `'observeABC(a, b, c)'`).
     *
     * The base class provides default implementations for the following standard
     * custom element lifecycle callbacks; users may override these, but should
     * call the super method to ensure
     * - `constructor`: Run when the element is created or upgraded
     * - `connectedCallback`: Run each time the element is connected to the
     *   document
     * - `disconnectedCallback`: Run each time the element is disconnected from
     *   the document
     * - `attributeChangedCallback`: Run each time an attribute in
     *   `observedAttributes` is set or removed (note: this element's default
     *   `observedAttributes` implementation will automatically return an array
     *   of dash-cased attributes based on `properties`)
     *
     * @mixinFunction
     * @polymer
     * @appliesMixin PropertyEffects
     * @appliesMixin PropertiesMixin
     * @property rootPath {string} Set to the value of `rootPath`,
     *   which defaults to the main document path
     * @property importPath {string} Set to the value of the class's static
     *   `importPath` property, which defaults to the path of this element's
     *   `dom-module` (when `is` is used), but can be overridden for other
     *   import strategies.
     * @summary Element class mixin that provides the core API for Polymer's
     * meta-programming features.
     */
    const ElementMixin = dedupingMixin(base => {

      /**
       * @constructor
       * @extends {base}
       * @implements {Polymer_PropertyEffects}
       * @implements {Polymer_PropertiesMixin}
       * @private
       */
      const polymerElementBase = PropertiesMixin(PropertyEffects(base));

      /**
       * Returns a list of properties with default values.
       * This list is created as an optimization since it is a subset of
       * the list returned from `_properties`.
       * This list is used in `_initializeProperties` to set property defaults.
       *
       * @param {PolymerElementConstructor} constructor Element class
       * @return {PolymerElementProperties} Flattened properties for this class
       *   that have default values
       * @private
       */
      function propertyDefaults(constructor) {
        if (!constructor.hasOwnProperty(
          JSCompiler_renameProperty('__propertyDefaults', constructor))) {
          constructor.__propertyDefaults = null;
          let props = constructor._properties;
          for (let p in props) {
            let info = props[p];
            if ('value' in info) {
              constructor.__propertyDefaults = constructor.__propertyDefaults || {};
              constructor.__propertyDefaults[p] = info;
            }
          }
        }
        return constructor.__propertyDefaults;
      }

      /**
       * Returns a memoized version of the the `observers` array.
       * @param {PolymerElementConstructor} constructor Element class
       * @return {Array} Array containing own observers for the given class
       * @protected
       */
      function ownObservers(constructor) {
        if (!constructor.hasOwnProperty(
          JSCompiler_renameProperty('__ownObservers', constructor))) {
            constructor.__ownObservers =
            constructor.hasOwnProperty(JSCompiler_renameProperty('observers', constructor)) ?
            /** @type {PolymerElementConstructor} */ (constructor).observers : null;
        }
        return constructor.__ownObservers;
      }

      /**
       * Creates effects for a property.
       *
       * Note, once a property has been set to
       * `readOnly`, `computed`, `reflectToAttribute`, or `notify`
       * these values may not be changed. For example, a subclass cannot
       * alter these settings. However, additional `observers` may be added
       * by subclasses.
       *
       * The info object should may contain property metadata as follows:
       *
       * * `type`: {function} type to which an attribute matching the property
       * is deserialized. Note the property is camel-cased from a dash-cased
       * attribute. For example, 'foo-bar' attribute is deserialized to a
       * property named 'fooBar'.
       *
       * * `readOnly`: {boolean} creates a readOnly property and
       * makes a private setter for the private of the form '_setFoo' for a
       * property 'foo',
       *
       * * `computed`: {string} creates a computed property. A computed property
       * also automatically is set to `readOnly: true`. The value is calculated
       * by running a method and arguments parsed from the given string. For
       * example 'compute(foo)' will compute a given property when the
       * 'foo' property changes by executing the 'compute' method. This method
       * must return the computed value.
       *
       * * `reflectToAttribute`: {boolean} If true, the property value is reflected
       * to an attribute of the same name. Note, the attribute is dash-cased
       * so a property named 'fooBar' is reflected as 'foo-bar'.
       *
       * * `notify`: {boolean} sends a non-bubbling notification event when
       * the property changes. For example, a property named 'foo' sends an
       * event named 'foo-changed' with `event.detail` set to the value of
       * the property.
       *
       * * observer: {string} name of a method that runs when the property
       * changes. The arguments of the method are (value, previousValue).
       *
       * Note: Users may want control over modifying property
       * effects via subclassing. For example, a user might want to make a
       * reflectToAttribute property not do so in a subclass. We've chosen to
       * disable this because it leads to additional complication.
       * For example, a readOnly effect generates a special setter. If a subclass
       * disables the effect, the setter would fail unexpectedly.
       * Based on feedback, we may want to try to make effects more malleable
       * and/or provide an advanced api for manipulating them.
       * Also consider adding warnings when an effect cannot be changed.
       *
       * @param {!PolymerElement} proto Element class prototype to add accessors
       *   and effects to
       * @param {string} name Name of the property.
       * @param {Object} info Info object from which to create property effects.
       * Supported keys:
       * @param {Object} allProps Flattened map of all properties defined in this
       *   element (including inherited properties)
       * @return {void}
       * @private
       */
      function createPropertyFromConfig(proto, name, info, allProps) {
        // computed forces readOnly...
        if (info.computed) {
          info.readOnly = true;
        }
        // Note, since all computed properties are readOnly, this prevents
        // adding additional computed property effects (which leads to a confusing
        // setup where multiple triggers for setting a property)
        // While we do have `hasComputedEffect` this is set on the property's
        // dependencies rather than itself.
        if (info.computed && !proto._hasReadOnlyEffect(name)) {
          proto._createComputedProperty(name, info.computed, allProps);
        }
        if (info.readOnly && !proto._hasReadOnlyEffect(name)) {
          proto._createReadOnlyProperty(name, !info.computed);
        }
        if (info.reflectToAttribute && !proto._hasReflectEffect(name)) {
          proto._createReflectedProperty(name);
        }
        if (info.notify && !proto._hasNotifyEffect(name)) {
          proto._createNotifyingProperty(name);
        }
        // always add observer
        if (info.observer) {
          proto._createPropertyObserver(name, info.observer, allProps[info.observer]);
        }
        // always create the mapping from attribute back to property for deserialization.
        proto._addPropertyToAttributeMap(name);
      }

      /**
       * Process all style elements in the element template. Styles with the
       * `include` attribute are processed such that any styles in
       * the associated "style modules" are included in the element template.
       * @param {PolymerElementConstructor} klass Element class
       * @param {!HTMLTemplateElement} template Template to process
       * @param {string} is Name of element
       * @param {string} baseURI Base URI for element
       * @private
       */
      function processElementStyles(klass, template, is, baseURI) {
        const templateStyles = template.content.querySelectorAll('style');
        const stylesWithImports = stylesFromTemplate(template);
        // insert styles from <link rel="import" type="css"> at the top of the template
        const linkedStyles = stylesFromModuleImports(is);
        const firstTemplateChild = template.content.firstElementChild;
        for (let idx = 0; idx < linkedStyles.length; idx++) {
          let s = linkedStyles[idx];
          s.textContent = klass._processStyleText(s.textContent, baseURI);
          template.content.insertBefore(s, firstTemplateChild);
        }
        // keep track of the last "concrete" style in the template we have encountered
        let templateStyleIndex = 0;
        // ensure all gathered styles are actually in this template.
        for (let i = 0; i < stylesWithImports.length; i++) {
          let s = stylesWithImports[i];
          let templateStyle = templateStyles[templateStyleIndex];
          // if the style is not in this template, it's been "included" and
          // we put a clone of it in the template before the style that included it
          if (templateStyle !== s) {
            s = s.cloneNode(true);
            templateStyle.parentNode.insertBefore(s, templateStyle);
          } else {
            templateStyleIndex++;
          }
          s.textContent = klass._processStyleText(s.textContent, baseURI);
        }
        if (window.ShadyCSS) {
          window.ShadyCSS.prepareTemplate(template, is);
        }
      }

      /**
       * @polymer
       * @mixinClass
       * @unrestricted
       * @implements {Polymer_ElementMixin}
       */
      class PolymerElement extends polymerElementBase {

        /**
         * Override of PropertiesMixin _finalizeClass to create observers and
         * find the template.
         * @return {void}
         * @protected
         * @override
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
       static _finalizeClass() {
          super._finalizeClass();
          if (this.hasOwnProperty(
            JSCompiler_renameProperty('is', this)) &&  this.is) {
            register(this.prototype);
          }
          const observers = ownObservers(this);
          if (observers) {
            this.createObservers(observers, this._properties);
          }
          // note: create "working" template that is finalized at instance time
          let template = /** @type {PolymerElementConstructor} */ (this).template;
          if (template) {
            if (typeof template === 'string') {
              console.error('template getter must return HTMLTemplateElement');
              template = null;
            } else {
              template = template.cloneNode(true);
            }
          }

          this.prototype._template = template;
        }

        /**
         * Override of PropertiesChanged createProperties to create accessors
         * and property effects for all of the properties.
         * @return {void}
         * @protected
         * @override
         */
         static createProperties(props) {
          for (let p in props) {
            createPropertyFromConfig(this.prototype, p, props[p], props);
          }
        }

        /**
         * Creates observers for the given `observers` array.
         * Leverages `PropertyEffects` to create observers.
         * @param {Object} observers Array of observer descriptors for
         *   this class
         * @param {Object} dynamicFns Object containing keys for any properties
         *   that are functions and should trigger the effect when the function
         *   reference is changed
         * @return {void}
         * @protected
         */
        static createObservers(observers, dynamicFns) {
          const proto = this.prototype;
          for (let i=0; i < observers.length; i++) {
            proto._createMethodObserver(observers[i], dynamicFns);
          }
        }

        /**
         * Returns the template that will be stamped into this element's shadow root.
         *
         * If a `static get is()` getter is defined, the default implementation
         * will return the first `<template>` in a `dom-module` whose `id`
         * matches this element's `is`.
         *
         * Users may override this getter to return an arbitrary template
         * (in which case the `is` getter is unnecessary). The template returned
         * must be an `HTMLTemplateElement`.
         *
         * Note that when subclassing, if the super class overrode the default
         * implementation and the subclass would like to provide an alternate
         * template via a `dom-module`, it should override this getter and
         * return `DomModule.import(this.is, 'template')`.
         *
         * If a subclass would like to modify the super class template, it should
         * clone it rather than modify it in place.  If the getter does expensive
         * work such as cloning/modifying a template, it should memoize the
         * template for maximum performance:
         *
         *   let memoizedTemplate;
         *   class MySubClass extends MySuperClass {
         *     static get template() {
         *       if (!memoizedTemplate) {
         *         memoizedTemplate = super.template.cloneNode(true);
         *         let subContent = document.createElement('div');
         *         subContent.textContent = 'This came from MySubClass';
         *         memoizedTemplate.content.appendChild(subContent);
         *       }
         *       return memoizedTemplate;
         *     }
         *   }
         *
         * @return {HTMLTemplateElement|string} Template to be stamped
         */
        static get template() {
          if (!this.hasOwnProperty(JSCompiler_renameProperty('_template', this))) {
            this._template = DomModule && DomModule.import(
              /** @type {PolymerElementConstructor}*/ (this).is, 'template') ||
              // note: implemented so a subclass can retrieve the super
              // template; call the super impl this way so that `this` points
              // to the superclass.
              Object.getPrototypeOf(/** @type {PolymerElementConstructor}*/ (this).prototype).constructor.template;
          }
          return this._template;
        }

        /**
         * Path matching the url from which the element was imported.
         *
         * This path is used to resolve url's in template style cssText.
         * The `importPath` property is also set on element instances and can be
         * used to create bindings relative to the import path.
         *
         * For elements defined in ES modules, users should implement
         * `static get importMeta() { return import.meta; }`, and the default
         * implementation of `importPath` will  return `import.meta.url`'s path.
         * For elements defined in HTML imports, this getter will return the path
         * to the document containing a `dom-module` element matching this
         * element's static `is` property.
         *
         * Note, this path should contain a trailing `/`.
         *
         * @return {string} The import path for this element class
         * @suppress {missingProperties}
         */
        static get importPath() {
          if (!this.hasOwnProperty(JSCompiler_renameProperty('_importPath', this))) {
            const meta = this.importMeta;
            if (meta) {
              this._importPath = pathFromUrl(meta.url);
            } else {
              const module = DomModule && DomModule.import(/** @type {PolymerElementConstructor} */ (this).is);
              this._importPath = (module && module.assetpath) ||
                Object.getPrototypeOf(/** @type {PolymerElementConstructor}*/ (this).prototype).constructor.importPath;
            }
          }
          return this._importPath;
        }

        constructor() {
          super();
          /** @type {HTMLTemplateElement} */
          this._template;
          /** @type {string} */
          this._importPath;
          /** @type {string} */
          this.rootPath;
          /** @type {string} */
          this.importPath;
          /** @type {StampedTemplate | HTMLElement | ShadowRoot} */
          this.root;
          /** @type {!Object<string, !Element>} */
          this.$;
        }

        /**
         * Overrides the default `PropertyAccessors` to ensure class
         * metaprogramming related to property accessors and effects has
         * completed (calls `finalize`).
         *
         * It also initializes any property defaults provided via `value` in
         * `properties` metadata.
         *
         * @return {void}
         * @override
         * @suppress {invalidCasts}
         */
        _initializeProperties() {
          this.constructor.finalize();
          // note: finalize template when we have access to `localName` to
          // avoid dependence on `is` for polyfilling styling.
          this.constructor._finalizeTemplate(/** @type {!HTMLElement} */(this).localName);
          super._initializeProperties();
          // set path defaults
          this.rootPath = rootPath;
          this.importPath = this.constructor.importPath;
          // apply property defaults...
          let p$ = propertyDefaults(this.constructor);
          if (!p$) {
            return;
          }
          for (let p in p$) {
            let info = p$[p];
            // Don't set default value if there is already an own property, which
            // happens when a `properties` property with default but no effects had
            // a property set (e.g. bound) by its host before upgrade
            if (!this.hasOwnProperty(p)) {
              let value = typeof info.value == 'function' ?
                info.value.call(this) :
                info.value;
              // Set via `_setProperty` if there is an accessor, to enable
              // initializing readOnly property defaults
              if (this._hasAccessor(p)) {
                this._setPendingProperty(p, value, true);
              } else {
                this[p] = value;
              }
            }
          }
        }

        /**
         * Gather style text for a style element in the template.
         *
         * @param {string} cssText Text containing styling to process
         * @param {string} baseURI Base URI to rebase CSS paths against
         * @return {string} The processed CSS text
         * @protected
         */
        static _processStyleText(cssText, baseURI) {
          return resolveCss(cssText, baseURI);
        }

        /**
        * Configures an element `proto` to function with a given `template`.
        * The element name `is` and extends `ext` must be specified for ShadyCSS
        * style scoping.
        *
        * @param {string} is Tag name (or type extension name) for this element
        * @return {void}
        * @protected
        */
        static _finalizeTemplate(is) {
          /** @const {HTMLTemplateElement} */
          const template = this.prototype._template;
          if (template && !template.__polymerFinalized) {
            template.__polymerFinalized = true;
            const importPath = this.importPath;
            const baseURI = importPath ? resolveUrl(importPath) : '';
            // e.g. support `include="module-name"`, and ShadyCSS
            processElementStyles(this, template, is, baseURI);
            this.prototype._bindTemplate(template);
          }
        }

        /**
         * Provides a default implementation of the standard Custom Elements
         * `connectedCallback`.
         *
         * The default implementation enables the property effects system and
         * flushes any pending properties, and updates shimmed CSS properties
         * when using the ShadyCSS scoping/custom properties polyfill.
         *
         * @suppress {missingProperties, invalidCasts} Super may or may not implement the callback
         * @return {void}
         */
        connectedCallback() {
          if (window.ShadyCSS && this._template) {
            window.ShadyCSS.styleElement(/** @type {!HTMLElement} */(this));
          }
          super.connectedCallback();
        }

        /**
         * Stamps the element template.
         *
         * @return {void}
         * @override
         */
        ready() {
          if (this._template) {
            this.root = this._stampTemplate(this._template);
            this.$ = this.root.$;
          }
          super.ready();
        }

        /**
         * Implements `PropertyEffects`'s `_readyClients` call. Attaches
         * element dom by calling `_attachDom` with the dom stamped from the
         * element's template via `_stampTemplate`. Note that this allows
         * client dom to be attached to the element prior to any observers
         * running.
         *
         * @return {void}
         * @override
         */
        _readyClients() {
          if (this._template) {
            this.root = this._attachDom(/** @type {StampedTemplate} */(this.root));
          }
          // The super._readyClients here sets the clients initialized flag.
          // We must wait to do this until after client dom is created/attached
          // so that this flag can be checked to prevent notifications fired
          // during this process from being handled before clients are ready.
          super._readyClients();
        }


        /**
         * Attaches an element's stamped dom to itself. By default,
         * this method creates a `shadowRoot` and adds the dom to it.
         * However, this method may be overridden to allow an element
         * to put its dom in another location.
         *
         * @throws {Error}
         * @suppress {missingReturn}
         * @param {StampedTemplate} dom to attach to the element.
         * @return {ShadowRoot} node to which the dom has been attached.
         */
        _attachDom(dom) {
          if (this.attachShadow) {
            if (dom) {
              if (!this.shadowRoot) {
                this.attachShadow({mode: 'open'});
              }
              this.shadowRoot.appendChild(dom);
              return this.shadowRoot;
            }
            return null;
          } else {
            throw new Error('ShadowDOM not available. ' +
              // TODO(sorvell): move to compile-time conditional when supported
            'PolymerElement can create dom as children instead of in ' +
            'ShadowDOM by setting `this.root = this;\` before \`ready\`.');
          }
        }

        /**
         * When using the ShadyCSS scoping and custom property shim, causes all
         * shimmed styles in this element (and its subtree) to be updated
         * based on current custom property values.
         *
         * The optional parameter overrides inline custom property styles with an
         * object of properties where the keys are CSS properties, and the values
         * are strings.
         *
         * Example: `this.updateStyles({'--color': 'blue'})`
         *
         * These properties are retained unless a value of `null` is set.
         *
         * Note: This function does not support updating CSS mixins.
         * You can not dynamically change the value of an `@apply`.
         *
         * @param {Object=} properties Bag of custom property key/values to
         *   apply to this element.
         * @return {void}
         * @suppress {invalidCasts}
         */
        updateStyles(properties) {
          if (window.ShadyCSS) {
            window.ShadyCSS.styleSubtree(/** @type {!HTMLElement} */(this), properties);
          }
        }

        /**
         * Rewrites a given URL relative to a base URL. The base URL defaults to
         * the original location of the document containing the `dom-module` for
         * this element. This method will return the same URL before and after
         * bundling.
         *
         * Note that this function performs no resolution for URLs that start
         * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
         * URL resolution, use `window.URL`.
         *
         * @param {string} url URL to resolve.
         * @param {string=} base Optional base URL to resolve against, defaults
         * to the element's `importPath`
         * @return {string} Rewritten URL relative to base
         */
        resolveUrl(url, base) {
          if (!base && this.importPath) {
            base = resolveUrl(this.importPath);
          }
          return resolveUrl(url, base);
        }

        /**
         * Overrides `PropertyAccessors` to add map of dynamic functions on
         * template info, for consumption by `PropertyEffects` template binding
         * code. This map determines which method templates should have accessors
         * created for them.
         *
         * @override
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        static _parseTemplateContent(template, templateInfo, nodeInfo) {
          templateInfo.dynamicFns = templateInfo.dynamicFns || this._properties;
          return super._parseTemplateContent(template, templateInfo, nodeInfo);
        }

      }

      return PolymerElement;
    });

    /**
     * Registers a class prototype for telemetry purposes.
     * @param {HTMLElement} prototype Element prototype to register
     * @this {this}
     * @protected
     */
    function register(prototype) {
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Class representing a static string value which can be used to filter
     * strings by asseting that they have been created via this class. The
     * `value` property returns the string passed to the constructor.
     */
    class LiteralString {
      constructor(string) {
        /** @type {string} */
        this.value = string.toString();
      }
      /**
       * @return {string} LiteralString string value
       * @override
       */
      toString() {
        return this.value;
      }
    }

    /**
     * @param {*} value Object to stringify into HTML
     * @return {string} HTML stringified form of `obj`
     */
    function literalValue(value) {
      if (value instanceof LiteralString) {
        return /** @type {!LiteralString} */(value).value;
      } else {
        throw new Error(
            `non-literal value passed to Polymer's htmlLiteral function: ${value}`
        );
      }
    }

    /**
     * @param {*} value Object to stringify into HTML
     * @return {string} HTML stringified form of `obj`
     */
    function htmlValue(value) {
      if (value instanceof HTMLTemplateElement) {
        return /** @type {!HTMLTemplateElement } */(value).innerHTML;
      } else if (value instanceof LiteralString) {
        return literalValue(value);
      } else {
        throw new Error(
            `non-template value passed to Polymer's html function: ${value}`);
      }
    }

    /**
     * A template literal tag that creates an HTML <template> element from the
     * contents of the string.
     *
     * This allows you to write a Polymer Template in JavaScript.
     *
     * Templates can be composed by interpolating `HTMLTemplateElement`s in
     * expressions in the JavaScript template literal. The nested template's
     * `innerHTML` is included in the containing template.  The only other
     * values allowed in expressions are those returned from `htmlLiteral`
     * which ensures only literal values from JS source ever reach the HTML, to
     * guard against XSS risks.
     *
     * All other values are disallowed in expressions to help prevent XSS
     * attacks; however, `htmlLiteral` can be used to compose static
     * string values into templates. This is useful to compose strings into
     * places that do not accept html, like the css text of a `style`
     * element.
     *
     * Example:
     *
     *     static get template() {
     *       return html`
     *         <style>:host{ content:"..." }</style>
     *         <div class="shadowed">${this.partialTemplate}</div>
     *         ${super.template}
     *       `;
     *     }
     *     static get partialTemplate() { return html`<span>Partial!</span>`; }
     *
     * @param {!ITemplateArray} strings Constant parts of tagged template literal
     * @param {...*} values Variable parts of tagged template literal
     * @return {!HTMLTemplateElement} Constructed HTMLTemplateElement
     */
    const html$1 = function html(strings, ...values) {
      const template = /** @type {!HTMLTemplateElement} */(document.createElement('template'));
      template.innerHTML = values.reduce((acc, v, idx) =>
          acc + htmlValue(v) + strings[idx + 1], strings[0]);
      return template;
    };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Base class that provides the core API for Polymer's meta-programming
     * features including template stamping, data-binding, attribute deserialization,
     * and property change observation.
     *
     * @customElement
     * @polymer
     * @constructor
     * @implements {Polymer_ElementMixin}
     * @extends HTMLElement
     * @appliesMixin ElementMixin
     * @summary Custom element base class that provides the core API for Polymer's
     *   key meta-programming features including template stamping, data-binding,
     *   attribute deserialization, and property change observation
     */
    const PolymerElement = ElementMixin(HTMLElement);

    function toArray(objectOrArray) {
      objectOrArray = objectOrArray || [];
      return Array.isArray(objectOrArray) ? objectOrArray : [objectOrArray];
    }

    function log(msg) {
      return `[Vaadin.Router] ${msg}`;
    }

    const MODULE = 'module';
    const NOMODULE = 'nomodule';
    const bundleKeys = [MODULE, NOMODULE];

    function ensureBundle(src) {
      if (!src.match(/.+\.[m]?js$/)) {
        throw new Error(
          log(`Unsupported type for bundle "${src}": .js or .mjs expected.`)
        );
      }
    }

    function ensureRoute(route) {
      if (!route || !isString(route.path)) {
        throw new Error(
          log(`Expected route config to be an object with a "path" string property, or an array of such objects`)
        );
      }

      const bundle = route.bundle;

      const stringKeys = ['component', 'redirect', 'bundle'];
      if (
        !isFunction(route.action) &&
        !Array.isArray(route.children) &&
        !isFunction(route.children) &&
        !isObject(bundle) &&
        !stringKeys.some(key => isString(route[key]))
      ) {
        throw new Error(
          log(
            `Expected route config "${route.path}" to include either "${stringKeys.join('", "')}" ` +
            `or "action" function but none found.`
          )
        );
      }

      if (bundle) {
        if (isString(bundle)) {
          ensureBundle(bundle);
        } else if (!bundleKeys.some(key => key in bundle)) {
          throw new Error(
            log('Expected route bundle to include either "' + NOMODULE + '" or "' + MODULE + '" keys, or both')
          );
        } else {
          bundleKeys.forEach(key => key in bundle && ensureBundle(bundle[key]));
        }
      }

      if (route.redirect) {
        ['bundle', 'component'].forEach(overriddenProp => {
          if (overriddenProp in route) {
            console.warn(
              log(
                `Route config "${route.path}" has both "redirect" and "${overriddenProp}" properties, ` +
                `and "redirect" will always override the latter. Did you mean to only use "${overriddenProp}"?`
              )
            );
          }
        });
      }
    }

    function ensureRoutes(routes) {
      toArray(routes).forEach(route => ensureRoute(route));
    }

    function loadScript(src, key) {
      let script = document.head.querySelector('script[src="' + src + '"][async]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('src', src);
        if (key === MODULE) {
          script.setAttribute('type', MODULE);
        } else if (key === NOMODULE) {
          script.setAttribute(NOMODULE, '');
        }
        script.async = true;
      }
      return new Promise((resolve, reject) => {
        script.onreadystatechange = script.onload = e => {
          script.__dynamicImportLoaded = true;
          resolve(e);
        };
        script.onerror = e => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
          reject(e);
        };
        if (script.parentNode === null) {
          document.head.appendChild(script);
        } else if (script.__dynamicImportLoaded) {
          resolve();
        }
      });
    }

    function loadBundle(bundle) {
      if (isString(bundle)) {
        return loadScript(bundle);
      } else {
        return Promise.race(
          bundleKeys
            .filter(key => key in bundle)
            .map(key => loadScript(bundle[key], key))
        );
      }
    }

    function fireRouterEvent(type, detail) {
      window.dispatchEvent(
        new CustomEvent(
          `vaadin-router-${type}`, {detail}));
    }

    function isObject(o) {
      // guard against null passing the typeof check
      return typeof o === 'object' && !!o;
    }

    function isFunction(f) {
      return typeof f === 'function';
    }

    function isString(s) {
      return typeof s === 'string';
    }

    function getNotFoundError(context) {
      const error = new Error(log(`Page not found (${context.pathname})`));
      error.context = context;
      error.code = 404;
      return error;
    }

    /* istanbul ignore next: coverage is calculated in Chrome, this code is for IE */
    function getAnchorOrigin(anchor) {
      // IE11: on HTTP and HTTPS the default port is not included into
      // window.location.origin, so won't include it here either.
      const port = anchor.port;
      const protocol = anchor.protocol;
      const defaultHttp = protocol === 'http:' && port === '80';
      const defaultHttps = protocol === 'https:' && port === '443';
      const host = (defaultHttp || defaultHttps)
        ? anchor.hostname // does not include the port number (e.g. www.example.org)
        : anchor.host; // does include the port number (e.g. www.example.org:80)
      return `${protocol}//${host}`;
    }

    // The list of checks is not complete:
    //  - SVG support is missing
    //  - the 'rel' attribute is not considered
    function vaadinRouterGlobalClickHandler(event) {
      // ignore the click if the default action is prevented
      if (event.defaultPrevented) {
        return;
      }

      // ignore the click if not with the primary mouse button
      if (event.button !== 0) {
        return;
      }

      // ignore the click if a modifier key is pressed
      if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      // find the <a> element that the click is at (or within)
      let anchor = event.target;
      const path = event.composedPath
        ? event.composedPath()
        : (event.path || []);

      // FIXME(web-padawan): `Symbol.iterator` used by webcomponentsjs is broken for arrays
      // example to check: `for...of` loop here throws the "Not yet implemented" error
      for (let i = 0; i < path.length; i++) {
        const target = path[i];
        if (target.nodeName && target.nodeName.toLowerCase() === 'a') {
          anchor = target;
          break;
        }
      }

      while (anchor && anchor.nodeName.toLowerCase() !== 'a') {
        anchor = anchor.parentNode;
      }

      // ignore the click if not at an <a> element
      if (!anchor || anchor.nodeName.toLowerCase() !== 'a') {
        return;
      }

      // ignore the click if the <a> element has a non-default target
      if (anchor.target && anchor.target.toLowerCase() !== '_self') {
        return;
      }

      // ignore the click if the <a> element has the 'download' attribute
      if (anchor.hasAttribute('download')) {
        return;
      }

      // ignore the click if the target URL is a fragment on the current page
      if (anchor.pathname === window.location.pathname && anchor.hash !== '') {
        return;
      }

      // ignore the click if the target is external to the app
      // In IE11 HTMLAnchorElement does not have the `origin` property
      const origin = anchor.origin || getAnchorOrigin(anchor);
      if (origin !== window.location.origin) {
        return;
      }

      // if none of the above, convert the click into a navigation event
      event.preventDefault();
      fireRouterEvent('go', {pathname: anchor.pathname});
    }

    /**
     * A navigation trigger for Vaadin Router that translated clicks on `<a>` links
     * into Vaadin Router navigation events.
     *
     * Only regular clicks on in-app links are translated (primary mouse button, no
     * modifier keys, the target href is within the app's URL space).
     *
     * @memberOf Vaadin.Router.Triggers
     * @type {NavigationTrigger}
     */
    const CLICK = {
      activate() {
        window.document.addEventListener('click', vaadinRouterGlobalClickHandler);
      },

      inactivate() {
        window.document.removeEventListener('click', vaadinRouterGlobalClickHandler);
      }
    };

    // PopStateEvent constructor shim
    const isIE = /Trident/.test(navigator.userAgent);

    /* istanbul ignore next: coverage is calculated in Chrome, this code is for IE */
    if (isIE && !isFunction(window.PopStateEvent)) {
      window.PopStateEvent = function(inType, params) {
        params = params || {};
        var e = document.createEvent('Event');
        e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
        e.state = params.state || null;
        return e;
      };
      window.PopStateEvent.prototype = window.Event.prototype;
    }

    function vaadinRouterGlobalPopstateHandler(event) {
      if (event.state === 'vaadin-router-ignore') {
        return;
      }
      fireRouterEvent('go', {pathname: window.location.pathname});
    }

    /**
     * A navigation trigger for Vaadin Router that translates popstate events into
     * Vaadin Router navigation events.
     *
     * @memberOf Vaadin.Router.Triggers
     * @type {NavigationTrigger}
     */
    const POPSTATE = {
      activate() {
        window.addEventListener('popstate', vaadinRouterGlobalPopstateHandler);
      },

      inactivate() {
        window.removeEventListener('popstate', vaadinRouterGlobalPopstateHandler);
      }
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * Default configs.
     */
    var DEFAULT_DELIMITER = '/';
    var DEFAULT_DELIMITERS = './';

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
      '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {string}  str
     * @param  {Object=} options
     * @return {!Array}
     */
    function parse (str, options) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
      var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
      var pathEscaped = false;
      var res;

      while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          pathEscaped = true;
          continue
        }

        var prev = '';
        var next = str[index];
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];

        if (!pathEscaped && path.length) {
          var k = path.length - 1;

          if (delimiters.indexOf(path[k]) > -1) {
            prev = path[k];
            path = path.slice(0, k);
          }
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
          pathEscaped = false;
        }

        var partial = prev !== '' && next !== undefined && next !== prev;
        var repeat = modifier === '+' || modifier === '*';
        var optional = modifier === '?' || modifier === '*';
        var delimiter = prev || defaultDelimiter;
        var pattern = capture || group;

        tokens.push({
          name: name || key++,
          prefix: prev,
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          partial: partial,
          pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
        });
      }

      // Push any remaining characters.
      if (path || index < str.length) {
        tokens.push(path + str.substr(index));
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {string}             str
     * @param  {Object=}            options
     * @return {!function(Object=, Object=)}
     */
    function compile (str, options) {
      return tokensToFunction(parse(str, options))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
        }
      }

      return function (data, options) {
        var path = '';
        var encode = (options && options.encode) || encodeURIComponent;

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;
            continue
          }

          var value = data ? data[token.name] : undefined;
          var segment;

          if (Array.isArray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
            }

            if (value.length === 0) {
              if (token.optional) continue

              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }

            for (var j = 0; j < value.length; j++) {
              segment = encode(value[j], token);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            segment = encode(String(value), token);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
            }

            path += token.prefix + segment;
            continue
          }

          if (token.optional) {
            // Prepend partial segment prefixes.
            if (token.partial) path += token.prefix;

            continue
          }

          throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {string} str
     * @return {string}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {string} group
     * @return {string}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$/()])/g, '\\$1')
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {string}
     */
    function flags (options) {
      return options && options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {!RegExp} path
     * @param  {Array=}  keys
     * @return {!RegExp}
     */
    function regexpToRegexp (path, keys) {
      if (!keys) return path

      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            partial: false,
            pattern: null
          });
        }
      }

      return path
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {!Array}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      return new RegExp('(?:' + parts.join('|') + ')', flags(options))
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {string}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function stringToRegexp (path, keys, options) {
      return tokensToRegExp(parse(path, options), keys, options)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {!Array}  tokens
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function tokensToRegExp (tokens, keys, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
      var delimiters = options.delimiters || DEFAULT_DELIMITERS;
      var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
      var route = '';
      var isEndDelimited = tokens.length === 0;

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
          isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.repeat
            ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
            : token.pattern;

          if (keys) keys.push(token);

          if (token.optional) {
            if (token.partial) {
              route += prefix + '(' + capture + ')?';
            } else {
              route += '(?:' + prefix + '(' + capture + '))?';
            }
          } else {
            route += prefix + '(' + capture + ')';
          }
        }
      }

      if (end) {
        if (!strict) route += '(?:' + delimiter + ')?';

        route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
      } else {
        if (!strict) route += '(?:' + delimiter + '(?=' + endsWith + '))?';
        if (!isEndDelimited) route += '(?=' + delimiter + '|' + endsWith + ')';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(string|RegExp|Array)} path
     * @param  {Array=}                keys
     * @param  {Object=}               options
     * @return {!RegExp}
     */
    function pathToRegexp (path, keys, options) {
      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (Array.isArray(path)) {
        return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
      }

      return stringToRegexp(/** @type {string} */ (path), keys, options)
    }
    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
     * Universal Router (https://www.kriasoft.com/universal-router/)
     *
     * Copyright (c) 2015-present Kriasoft.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.txt file in the root directory of this source tree.
     */

    const {hasOwnProperty} = Object.prototype;
    const cache = new Map();
    // see https://github.com/pillarjs/path-to-regexp/issues/148
    cache.set('|false', {
      keys: [],
      pattern: /(?:)/
    });

    function decodeParam(val) {
      try {
        return decodeURIComponent(val);
      } catch (err) {
        return val;
      }
    }

    function matchPath(routepath, path, exact, parentKeys, parentParams) {
      exact = !!exact;
      const cacheKey = `${routepath}|${exact}`;
      let regexp = cache.get(cacheKey);

      if (!regexp) {
        const keys = [];
        regexp = {
          keys,
          pattern: pathToRegexp_1(routepath, keys, {
            end: exact,
            strict: routepath === ''
          }),
        };
        cache.set(cacheKey, regexp);
      }

      const m = regexp.pattern.exec(path);
      if (!m) {
        return null;
      }

      const params = Object.assign({}, parentParams);

      for (let i = 1; i < m.length; i++) {
        const key = regexp.keys[i - 1];
        const prop = key.name;
        const value = m[i];
        if (value !== undefined || !hasOwnProperty.call(params, prop)) {
          if (key.repeat) {
            params[prop] = value ? value.split(key.delimiter).map(decodeParam) : [];
          } else {
            params[prop] = value ? decodeParam(value) : value;
          }
        }
      }

      return {
        path: m[0],
        keys: (parentKeys || []).concat(regexp.keys),
        params,
      };
    }

    /**
     * Universal Router (https://www.kriasoft.com/universal-router/)
     *
     * Copyright (c) 2015-present Kriasoft.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.txt file in the root directory of this source tree.
     */

    /**
     * Traverses the routes tree and matches its nodes to the given pathname from
     * the root down to the leaves. Each match consumes a part of the pathname and
     * the matching process continues for as long as there is a matching child
     * route for the remaining part of the pathname.
     *
     * The returned value is a lazily evaluated iterator.
     *
     * The leading "/" in a route path matters only for the root of the routes
     * tree (or if all parent routes are ""). In all other cases a leading "/" in
     * a child route path has no significance.
     *
     * The trailing "/" in a _route path_ matters only for the leaves of the
     * routes tree. A leaf route with a trailing "/" matches only a pathname that
     * also has a trailing "/".
     *
     * The trailing "/" in a route path does not affect matching of child routes
     * in any way.
     *
     * The trailing "/" in a _pathname_ generally does not matter (except for
     * the case of leaf nodes described above).
     *
     * The "" and "/" routes have special treatment:
     *  1. as a single route
     *     the "" and "/" routes match only the "" and "/" pathnames respectively
     *  2. as a parent in the routes tree
     *     the "" route matches any pathname without consuming any part of it
     *     the "/" route matches any absolute pathname consuming its leading "/"
     *  3. as a leaf in the routes tree
     *     the "" and "/" routes match only if the entire pathname is consumed by
     *         the parent routes chain. In this case "" and "/" are equivalent.
     *  4. several directly nested "" or "/" routes
     *     - directly nested "" or "/" routes are 'squashed' (i.e. nesting two
     *       "/" routes does not require a double "/" in the pathname to match)
     *     - if there are only "" in the parent routes chain, no part of the
     *       pathname is consumed, and the leading "/" in the child routes' paths
     *       remains significant
     *
     * Side effect:
     *   - the routes tree { path: '' } matches only the '' pathname
     *   - the routes tree { path: '', children: [ { path: '' } ] } matches any
     *     pathname (for the tree root)
     *
     * Prefix matching can be enabled also by `children: true`.
     */
    function matchRoute(route, pathname, ignoreLeadingSlash, parentKeys, parentParams) {
      let match;
      let childMatches;
      let childIndex = 0;
      let routepath = route.path || '';
      if (routepath.charAt(0) === '/') {
        if (ignoreLeadingSlash) {
          routepath = routepath.substr(1);
        }
        ignoreLeadingSlash = true;
      }

      return {
        next(routeToSkip) {
          if (route === routeToSkip) {
            return {done: true};
          }

          const children = route.__children = route.__children || route.children;

          if (!match) {
            match = matchPath(routepath, pathname, !children, parentKeys, parentParams);

            if (match) {
              return {
                done: false,
                value: {
                  route,
                  keys: match.keys,
                  params: match.params,
                  path: match.path
                },
              };
            }
          }

          if (match && children) {
            while (childIndex < children.length) {
              if (!childMatches) {
                const childRoute = children[childIndex];
                childRoute.parent = route;

                let matchedLength = match.path.length;
                if (matchedLength > 0 && pathname.charAt(matchedLength) === '/') {
                  matchedLength += 1;
                }

                childMatches = matchRoute(
                  childRoute,
                  pathname.substr(matchedLength),
                  ignoreLeadingSlash,
                  match.keys,
                  match.params
                );
              }

              const childMatch = childMatches.next(routeToSkip);
              if (!childMatch.done) {
                return {
                  done: false,
                  value: childMatch.value,
                };
              }

              childMatches = null;
              childIndex++;
            }
          }

          return {done: true};
        },
      };
    }

    /**
     * Universal Router (https://www.kriasoft.com/universal-router/)
     *
     * Copyright (c) 2015-present Kriasoft.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.txt file in the root directory of this source tree.
     */

    function resolveRoute(context) {
      if (isFunction(context.route.action)) {
        return context.route.action(context);
      }
      return undefined;
    }

    /**
     * Universal Router (https://www.kriasoft.com/universal-router/)
     *
     * Copyright (c) 2015-present Kriasoft.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE.txt file in the root directory of this source tree.
     */

    function isChildRoute(parentRoute, childRoute) {
      let route = childRoute;
      while (route) {
        route = route.parent;
        if (route === parentRoute) {
          return true;
        }
      }
      return false;
    }

    function generateErrorMessage(currentContext) {
      let errorMessage = `Path '${currentContext.pathname}' is not properly resolved due to an error.`;
      const routePath = (currentContext.route || {}).path;
      if (routePath) {
        errorMessage += ` Resolution had failed on route: '${routePath}'`;
      }
      return errorMessage;
    }

    function addRouteToChain(context, match) {
      const {route, path} = match;
      function shouldDiscardOldChain(oldChain, route) {
        return !route.parent || !oldChain || !oldChain.length || oldChain[oldChain.length - 1].route !== route.parent;
      }

      if (route && !route.__synthetic) {
        const item = {path, route};
        if (shouldDiscardOldChain(context.chain, route)) {
          context.chain = [item];
        } else {
          context.chain.push(item);
        }
      }
    }

    /**
     * @memberof Vaadin
     */
    class Resolver {
      constructor(routes, options = {}) {
        if (Object(routes) !== routes) {
          throw new TypeError('Invalid routes');
        }

        this.baseUrl = options.baseUrl || '';
        this.errorHandler = options.errorHandler;
        this.resolveRoute = options.resolveRoute || resolveRoute;
        this.context = Object.assign({resolver: this}, options.context);
        this.root = Array.isArray(routes) ? {path: '', __children: routes, parent: null, __synthetic: true} : routes;
        this.root.parent = null;
      }

      /**
       * Returns the current list of routes (as a shallow copy). Adding / removing
       * routes to / from the returned array does not affect the routing config,
       * but modifying the route objects does.
       *
       * @return {!Array<!Route>}
       */
      getRoutes() {
        return [...this.root.__children];
      }

      /**
       * Sets the routing config (replacing the existing one).
       *
       * @param {!Array<!Route>|!Route} routes a single route or an array of those
       *    (the array is shallow copied)
       */
      setRoutes(routes) {
        ensureRoutes(routes);
        const newRoutes = [...toArray(routes)];
        this.root.__children = newRoutes;
      }

      /**
       * Appends one or several routes to the routing config and returns the
       * effective routing config after the operation.
       *
       * @param {!Array<!Route>|!Route} routes a single route or an array of those
       *    (the array is shallow copied)
       * @return {!Array<!Route>}
       * @protected
       */
      addRoutes(routes) {
        ensureRoutes(routes);
        this.root.__children.push(...toArray(routes));
        return this.getRoutes();
      }

      /**
       * Removes all existing routes from the routing config.
       */
      removeRoutes() {
        this.setRoutes([]);
      }

      /**
       * Asynchronously resolves the given pathname, i.e. finds all routes matching
       * the pathname and tries resolving them one after another in the order they
       * are listed in the routes config until the first non-null result.
       *
       * Returns a promise that is fulfilled with the return value of an object that consists of the first
       * route handler result that returns something other than `null` or `undefined` and context used to get this result.
       *
       * If no route handlers return a non-null result, or if no route matches the
       * given pathname the returned promise is rejected with a 'page not found'
       * `Error`.
       *
       * @param {!string|!{pathname: !string}} pathnameOrContext the pathname to
       *    resolve or a context object with a `pathname` property and other
       *    properties to pass to the route resolver functions.
       * @return {!Promise<any>}
       */
      resolve(pathnameOrContext) {
        const context = Object.assign(
          {},
          this.context,
          isString(pathnameOrContext) ? {pathname: pathnameOrContext} : pathnameOrContext
        );
        const match = matchRoute(
          this.root,
          context.pathname.substr(this.baseUrl.length)
        );
        const resolve = this.resolveRoute;
        let matches = null;
        let nextMatches = null;
        let currentContext = context;

        function next(resume, parent = matches.value.route, prevResult) {
          const routeToSkip = prevResult === null && matches.value.route;
          matches = nextMatches || match.next(routeToSkip);
          nextMatches = null;

          if (!resume) {
            if (matches.done || !isChildRoute(parent, matches.value.route)) {
              nextMatches = matches;
              return Promise.resolve(null);
            }
          }

          if (matches.done) {
            return Promise.reject(getNotFoundError(context));
          }

          addRouteToChain(context, matches.value);
          currentContext = Object.assign({}, context, matches.value);

          return Promise.resolve(resolve(currentContext)).then(resolution => {
            if (resolution !== null && resolution !== undefined) {
              currentContext.result = resolution.result || resolution;
              return currentContext;
            }
            return next(resume, parent, resolution);
          });
        }

        context.next = next;

        return Promise.resolve()
          .then(() => next(true, this.root))
          .catch((error) => {
            const errorMessage = generateErrorMessage(currentContext);
            if (!error) {
              error = new Error(errorMessage);
            } else {
              console.warn(errorMessage);
            }
            error.context = error.context || currentContext;
            // DOMException has its own code which is read-only
            if (!(error instanceof DOMException)) {
              error.code = error.code || 500;
            }
            if (this.errorHandler) {
              currentContext.result = this.errorHandler(error);
              return currentContext;
            }
            throw error;
          });
      }
    }

    Resolver.pathToRegexp = pathToRegexp_1;

    /**
     * @typedef NavigationTrigger
     * @type {object}
     * @property {function()} activate
     * @property {function()} inactivate
     */

    /** @type {Array<NavigationTrigger>} */
    let triggers = [];

    function setNavigationTriggers(newTriggers) {
      triggers.forEach(trigger => trigger.inactivate());

      newTriggers.forEach(trigger => trigger.activate());

      triggers = newTriggers;
    }

    const willAnimate = elem => {
      const name = getComputedStyle(elem).getPropertyValue('animation-name');
      return name && name !== 'none';
    };

    const waitForAnimation = (elem, cb) => {
      const listener = () => {
        elem.removeEventListener('animationend', listener);
        cb();
      };
      elem.addEventListener('animationend', listener);
    };

    function animate(elem, className) {
      elem.classList.add(className);

      return new Promise(resolve => {
        if (willAnimate(elem)) {
          const rect = elem.getBoundingClientRect();
          const size = `height: ${rect.bottom - rect.top}px; width: ${rect.right - rect.left}px`;
          elem.setAttribute('style', `position: absolute; ${size}`);
          waitForAnimation(elem, () => {
            elem.classList.remove(className);
            elem.removeAttribute('style');
            resolve();
          });
        } else {
          elem.classList.remove(className);
          resolve();
        }
      });
    }

    const MAX_REDIRECT_COUNT = 256;

    function isResultNotEmpty(result) {
      return result !== null && result !== undefined;
    }

    function copyContextWithoutNext(context) {
      const copy = Object.assign({}, context);
      delete copy.next;
      return copy;
    }

    function createLocation({pathname = '', chain = [], params = {}, redirectFrom}, route) {
      return {
        pathname,
        routes: chain.map(item => item.route),
        route: (!route && chain.length && chain[chain.length - 1].route) || route,
        params,
        redirectFrom,
      };
    }

    function createRedirect(context, pathname) {
      const params = Object.assign({}, context.params);
      return {
        redirect: {
          pathname,
          from: context.pathname,
          params
        }
      };
    }

    function renderComponent(context, component) {
      const element = document.createElement(component);
      element.location = createLocation(context);
      const index = context.chain.map(item => item.route).indexOf(context.route);
      context.chain[index].element = element;
      return element;
    }

    function runCallbackIfPossible(callback, args, thisArg) {
      if (isFunction(callback)) {
        return callback.apply(thisArg, args);
      }
    }

    function amend(amendmentFunction, args, element) {
      return amendmentResult => {
        if (amendmentResult && (amendmentResult.cancel || amendmentResult.redirect)) {
          return amendmentResult;
        }

        if (element) {
          return runCallbackIfPossible(element[amendmentFunction], args, element);
        }
      };
    }

    function processNewChildren(newChildren, route) {
      if (!Array.isArray(newChildren) && !isObject(newChildren)) {
        throw new Error(
          log(
            `Incorrect "children" value for the route ${route.path}: expected array or object, but got ${newChildren}`
          )
        );
      }

      route.__children = [];
      const childRoutes = toArray(newChildren);
      for (let i = 0; i < childRoutes.length; i++) {
        ensureRoute(childRoutes[i]);
        route.__children.push(childRoutes[i]);
      }
    }

    function removeDomNodes(nodes) {
      if (nodes && nodes.length) {
        const parent = nodes[0].parentNode;
        for (let i = 0; i < nodes.length; i++) {
          parent.removeChild(nodes[i]);
        }
      }
    }

    function getMatchedPath(chain) {
      return chain.map(item => item.path).reduce((prev, path) => {
        if (path.length) {
          return prev + (prev.charAt(prev.length - 1) === '/' ? '' : '/') + path;
        }
        return prev;
      });
    }

    /**
     * A simple client-side router for single-page applications. It uses
     * express-style middleware and has a first-class support for Web Components and
     * lazy-loading. Works great in Polymer and non-Polymer apps.
     *
     * Use `new Router(outlet)` to create a new Router instance. The `outlet` parameter is a reference to the DOM node
     * to render the content into. The Router instance is automatically subscribed to navigation events on `window`.
     *
     * See [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html) for the detailed usage demo and code snippets.
     *
     * See also detailed API docs for the following methods, for the advanced usage:
     *
     * * [setOutlet](#/classes/Vaadin.Router#method-setOutlet) – should be used to configure the outlet.
     * * [setTriggers](#/classes/Vaadin.Router#method-setTriggers) – should be used to configure the navigation events.
     * * [setRoutes](#/classes/Vaadin.Router#method-setRoutes) – should be used to configure the routes.
     *
     * Only `setRoutes` has to be called manually, others are automatically invoked when creating a new instance.
     *
     * @memberof Vaadin
     * @extends Vaadin.Resolver
     * @demo demo/index.html
     * @summary JavaScript class that renders different DOM content depending on
     *    a given path. It can re-render when triggered or automatically on
     *    'popstate' and / or 'click' events.
     */
    class Router extends Resolver {

      /**
       * Creates a new Router instance with a given outlet, and
       * automatically subscribes it to navigation events on the `window`.
       * Using a constructor argument or a setter for outlet is equivalent:
       *
       * ```
       * const router = new Vaadin.Router();
       * router.setOutlet(outlet);
       * ```
       * @param {?Node} outlet
       * @param {?RouterOptions} options
       */
      constructor(outlet, options) {
        super([], Object.assign({}, options));
        this.resolveRoute = context => this.__resolveRoute(context);

        const triggers = Router.NavigationTrigger;
        Router.setTriggers.apply(Router, Object.keys(triggers).map(key => triggers[key]));

        /**
         * A promise that is settled after the current render cycle completes. If
         * there is no render cycle in progress the promise is immediately settled
         * with the last render cycle result.
         *
         * @public
         * @type {!Promise<!Vaadin.Router.Location>}
         */
        this.ready;
        this.ready = Promise.resolve(outlet);

        /**
         * Contains read-only information about the current router location:
         * pathname, active routes, parameters. See the
         * [Location type declaration](#/classes/Vaadin.Router.Location)
         * for more details.
         *
         * @public
         * @type {!Vaadin.Router.Location}
         */
        this.location;
        this.location = createLocation({});

        this.__lastStartedRenderId = 0;
        this.__navigationEventHandler = this.__onNavigationEvent.bind(this);
        this.setOutlet(outlet);
        this.subscribe();
      }

      __resolveRoute(context) {
        const route = context.route;

        const commands = {
          redirect: path => createRedirect(context, path),
          component: component => renderComponent(context, component)
        };
        const actionResult = runCallbackIfPossible(route.action, [context, commands], route);
        if (isResultNotEmpty(actionResult)) {
          return actionResult;
        }

        if (isString(route.redirect)) {
          return commands.redirect(route.redirect);
        }

        let callbacks = Promise.resolve();

        if (route.bundle) {
          callbacks = callbacks.then(() => loadBundle(route.bundle))
            .catch(() => {
              throw new Error(log(`Bundle not found: ${route.bundle}. Check if the file name is correct`));
            });
        }

        if (isFunction(route.children)) {
          callbacks = callbacks
            .then(() => route.children(copyContextWithoutNext(context)))
            .then(children => {
              // The route.children() callback might have re-written the
              // route.children property instead of returning a value
              if (!isResultNotEmpty(children) && !isFunction(route.children)) {
                children = route.children;
              }
              processNewChildren(children, route);
            });
        }

        return callbacks.then(() => {
          if (isString(route.component)) {
            return commands.component(route.component);
          }
        });
      }

      /**
       * Sets the router outlet (the DOM node where the content for the current
       * route is inserted). Any content pre-existing in the router outlet is
       * removed at the end of each render pass.
       *
       * NOTE: this method is automatically invoked first time when creating a new Router instance.
       *
       * @param {?Node} outlet the DOM node where the content for the current route
       *     is inserted.
       */
      setOutlet(outlet) {
        if (outlet) {
          this.__ensureOutlet(outlet);
        }
        this.__outlet = outlet;
      }

      /**
       * Returns the current router outlet. The initial value is `undefined`.
       *
       * @return {?Node} the current router outlet (or `undefined`)
       */
      getOutlet() {
        return this.__outlet;
      }

      /**
       * Sets the routing config (replacing the existing one) and triggers a
       * navigation event so that the router outlet is refreshed according to the
       * current `window.location` and the new routing config.
       *
       * Each route object may have the following properties, listed here in the processing order:
       * * `path` – the route path (relative to the parent route if any) in the
       * [express.js syntax](https://expressjs.com/en/guide/routing.html#route-paths").
       *
       * * `action` – the action that is executed before the route is resolved.
       * The value for this property should be a function, accepting a `context` parameter described below.
       * If present, this function is always invoked first, disregarding of the other properties' presence.
       * If the action returns a non-empty result, current route resolution is finished and other route config properties are ignored.
       * See also **Route Actions** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
       *
       * * `redirect` – other route's path to redirect to. Passes all route parameters to the redirect target.
       * The target route should also be defined.
       * See also **Redirects** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
       *
       * * `bundle` – string containing the path to `.js` or `.mjs` bundle to load before resolving the route,
       * or the object with "module" and "nomodule" keys referring to different bundles.
       * Each bundle is only loaded once. If "module" and "nomodule" are set, only one bundle is loaded,
       * depending on whether the browser supports ES modules or not.
       * The property is ignored when either an `action` returns the result or `redirect` property is present.
       * Any error, e.g. 404 while loading bundle will cause route resolution to throw.
       * See also **Code Splitting** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
       *
       * * `children` – an array of nested routes or a function that provides this
       * array at the render time. The function can be synchronous or asynchronous:
       * in the latter case the render is delayed until the returned promise is
       * resolved. The `children` function is executed every time when this route is
       * being rendered. This allows for dynamic route structures (e.g. backend-defined),
       * but it might have a performance impact as well. In order to avoid calling
       * the function on subsequent renders, you can override the `children` property
       * of the route object and save the calculated array there
       * (via `context.route.children = [ route1, route2, ...];`).
       * Parent routes are fully resolved before resolving the children. Children
       * 'path' values are relative to the parent ones.
       *
       * * `component` – the tag name of the Web Component to resolve the route to.
       * The property is ignored when either an `action` returns the result or `redirect` property is present.
       * If route contains the `component` property (or an action that return a component)
       * and its child route also contains the `component` property, child route's component
       * will be rendered as a light dom child of a parent component.
       *
       * For any route function (`action`, `children`) defined, the corresponding `route` object is available inside the callback
       * through the `this` reference. If you need to access it, make sure you define the callback as a non-arrow function
       * because arrow functions do not have their own `this` reference.
       *
       * `context` object that is passed to `action` function holds the following properties:
       * * `context.pathname` – string with the pathname being resolved
       *
       * * `context.params` – object with route parameters
       *
       * * `context.route` – object that holds the route that is currently being rendered.
       *
       * * `context.next()` – function for asynchronously getting the next route contents from the resolution chain (if any)
       *
       * * `context.redirect(path)` – function that creates a redirect data for the path specified.
       *
       * * `context.component(component)` – function that creates a new HTMLElement with current context
       *
       * @param {!Array<!Object>|!Object} routes a single route or an array of those
       */
      setRoutes(routes) {
        super.setRoutes(routes);
        this.__onNavigationEvent();
      }

      /**
       * Asynchronously resolves the given pathname and renders the resolved route
       * component into the router outlet. If no router outlet is set at the time of
       * calling this method, or at the time when the route resolution is completed,
       * a `TypeError` is thrown.
       *
       * Returns a promise that is fulfilled with the router outlet DOM Node after
       * the route component is created and inserted into the router outlet, or
       * rejected if no route matches the given path.
       *
       * If another render pass is started before the previous one is completed, the
       * result of the previous render pass is ignored.
       *
       * @param {!string|!{pathname: !string}} pathnameOrContext the pathname to
       *    render or a context object with a `pathname` property and other
       *    properties to pass to the resolver.
       * @return {!Promise<!Node>}
       */
      render(pathnameOrContext, shouldUpdateHistory) {
        const renderId = ++this.__lastStartedRenderId;
        const pathname = pathnameOrContext.pathname || pathnameOrContext;

        // Find the first route that resolves to a non-empty result
        this.ready = this.resolve(pathnameOrContext)

          // Process the result of this.resolve() and handle all special commands:
          // (redirect / prevent / component). If the result is a 'component',
          // then go deeper and build the entire chain of nested components matching
          // the pathname. Also call all 'on before' callbacks along the way.
          .then(context => this.__fullyResolveChain(context))

          .then(context => {
            if (renderId === this.__lastStartedRenderId) {
              const previousContext = this.__previousContext;

              // Check if the render was prevented and make an early return in that case
              if (context === previousContext) {
                return this.location;
              }

              if (shouldUpdateHistory) {
                this.__updateBrowserHistory(context.pathname, context.redirectFrom);
              }

              this.__addAppearingContent(context, previousContext);
              const animationDone = this.__animateIfNeeded(context);

              this.__runOnAfterEnterCallbacks(context);
              this.__runOnAfterLeaveCallbacks(context, previousContext);

              return animationDone.then(() => {
                if (renderId === this.__lastStartedRenderId) {
                  // If there is another render pass started after this one,
                  // the 'disappearing content' would be removed when the other
                  // render pass calls `this.__addAppearingContent()`
                  this.__removeDisappearingContent();

                  this.__previousContext = context;
                  this.location = createLocation(context);
                  fireRouterEvent('location-changed', {router: this, location: this.location});
                  return this.location;
                }
              });
            }
          })
          .catch(error => {
            if (renderId === this.__lastStartedRenderId) {
              if (shouldUpdateHistory) {
                this.__updateBrowserHistory(pathname);
              }
              removeDomNodes(this.__outlet && this.__outlet.children);
              this.location = createLocation({pathname});
              fireRouterEvent('error', {router: this, error, pathname});
              throw error;
            }
          });
        return this.ready;
      }

      __fullyResolveChain(originalContext, currentContext = originalContext) {
        return this.__amendWithResolutionResult(currentContext)
          .then(amendedContext => {
            const initialContext = amendedContext !== currentContext ? amendedContext : originalContext;
            return amendedContext.next()
              .then(nextContext => {
                if (nextContext === null) {
                  if (amendedContext.pathname !== getMatchedPath(amendedContext.chain)) {
                    throw getNotFoundError(initialContext);
                  }
                }
                return nextContext
                  ? this.__fullyResolveChain(initialContext, nextContext)
                  : this.__amendWithOnBeforeCallbacks(initialContext);
              });
          });
      }

      __amendWithResolutionResult(context) {
        const result = context.result;
        if (result instanceof HTMLElement) {
          return Promise.resolve(context);
        } else if (result.redirect) {
          return this.__redirect(result.redirect, context.__redirectCount)
            .then(context => this.__amendWithResolutionResult(context));
        } else if (result instanceof Error) {
          return Promise.reject(result);
        } else {
          return Promise.reject(
            new Error(
              log(
                `Invalid route resolution result for path "${context.pathname}". ` +
                `Expected redirect object or HTML element, but got: "${result}". ` +
                `Double check the action return value for the route.`
              )
            ));
        }
      }

      __amendWithOnBeforeCallbacks(contextWithFullChain) {
        return this.__runOnBeforeCallbacks(contextWithFullChain).then(amendedContext => {
          if (amendedContext === this.__previousContext || amendedContext === contextWithFullChain) {
            return amendedContext;
          }
          return this.__fullyResolveChain(amendedContext);
        });
      }

      __runOnBeforeCallbacks(newContext) {
        const previousContext = this.__previousContext || {};
        const previousChain = previousContext.chain || [];
        const newChain = newContext.chain;

        let callbacks = Promise.resolve();
        const prevent = () => ({cancel: true});
        const redirect = (pathname) => createRedirect(newContext, pathname);

        newContext.__divergedChainIndex = 0;
        if (previousChain.length) {
          for (let i = 0; i < Math.min(previousChain.length, newChain.length); i = ++newContext.__divergedChainIndex) {
            if (previousChain[i].route !== newChain[i].route || previousChain[i].path !== newChain[i].path) {
              break;
            }
          }

          for (let i = previousChain.length - 1; i >= newContext.__divergedChainIndex; i--) {
            const location = createLocation(newContext);
            callbacks = callbacks
              .then(amend('onBeforeLeave', [location, {prevent}, this], previousChain[i].element))
              .then(result => {
                if (!(result || {}).redirect) {
                  return result;
                }
              });
          }
        }

        for (let i = newContext.__divergedChainIndex; i < newChain.length; i++) {
          const location = createLocation(newContext, newChain[i].route);
          callbacks = callbacks.then(amend('onBeforeEnter', [location, {prevent, redirect}, this], newChain[i].element));
        }

        return callbacks.then(amendmentResult => {
          if (amendmentResult) {
            if (amendmentResult.cancel) {
              return this.__previousContext;
            }
            if (amendmentResult.redirect) {
              return this.__redirect(amendmentResult.redirect, newContext.__redirectCount);
            }
          }
          return newContext;
        });
      }

      __redirect(redirectData, counter) {
        if (counter > MAX_REDIRECT_COUNT) {
          throw new Error(log(`Too many redirects when rendering ${redirectData.from}`));
        }

        return this.resolve({
          pathname: Router.pathToRegexp.compile(redirectData.pathname)(redirectData.params),
          redirectFrom: redirectData.from,
          __redirectCount: (counter || 0) + 1
        });
      }

      __ensureOutlet(outlet = this.__outlet) {
        if (!(outlet instanceof Node)) {
          throw new TypeError(log(`Expected router outlet to be a valid DOM Node (but got ${outlet})`));
        }
      }

      __updateBrowserHistory(pathname, replace) {
        if (window.location.pathname !== pathname) {
          const changeState = replace ? 'replaceState' : 'pushState';
          window.history[changeState](null, document.title, pathname);
          window.dispatchEvent(new PopStateEvent('popstate', {state: 'vaadin-router-ignore'}));
        }
      }

      __addAppearingContent(context, previousContext) {
        this.__ensureOutlet();

        // If the previous 'entering' animation has not completed yet,
        // stop it and remove that content from the DOM before adding new one.
        this.__removeAppearingContent();

        // Find the deepest common parent between the last and the new component
        // chains. Update references for the unchanged elements in the new chain
        let deepestCommonParent = this.__outlet;
        for (let i = 0; i < context.__divergedChainIndex; i++) {
          const unchangedElement = previousContext && previousContext.chain[i].element;
          if (unchangedElement) {
            if (unchangedElement.parentNode === deepestCommonParent) {
              context.chain[i].element = unchangedElement;
              deepestCommonParent = unchangedElement;
            } else {
              break;
            }
          }
        }

        // Keep two lists of DOM elements:
        //  - those that should be removed once the transition animation is over
        //  - and those that should remain
        this.__disappearingContent = Array.from(deepestCommonParent.children);
        this.__appearingContent = [];

        // Add new elements (starting after the deepest common parent) to the DOM.
        // That way only the components that are actually different between the two
        // locations are added to the DOM (and those that are common remain in the
        // DOM without first removing and then adding them again).
        let parentElement = deepestCommonParent;
        for (let i = context.__divergedChainIndex; i < context.chain.length; i++) {
          const elementToAdd = context.chain[i].element;
          if (elementToAdd) {
            parentElement.appendChild(elementToAdd);
            if (parentElement === deepestCommonParent) {
              this.__appearingContent.push(elementToAdd);
            }
            parentElement = elementToAdd;
          }
        }
      }

      __removeDisappearingContent() {
        if (this.__disappearingContent) {
          removeDomNodes(this.__disappearingContent);
        }
        this.__disappearingContent = null;
        this.__appearingContent = null;
      }

      __removeAppearingContent() {
        if (this.__disappearingContent && this.__appearingContent) {
          removeDomNodes(this.__appearingContent);
          this.__disappearingContent = null;
          this.__appearingContent = null;
        }
      }

      __runOnAfterLeaveCallbacks(currentContext, targetContext) {
        if (!targetContext) {
          return;
        }

        // REVERSE iteration: from Z to A
        for (let i = targetContext.chain.length - 1; i >= currentContext.__divergedChainIndex; i--) {
          const currentComponent = targetContext.chain[i].element;
          if (!currentComponent) {
            continue;
          }
          try {
            const location = createLocation(currentContext);
            runCallbackIfPossible(
              currentComponent.onAfterLeave,
              [location, {}, targetContext.resolver],
              currentComponent);
          } finally {
            removeDomNodes(currentComponent.children);
          }
        }
      }

      __runOnAfterEnterCallbacks(currentContext) {
        // forward iteration: from A to Z
        for (let i = currentContext.__divergedChainIndex; i < currentContext.chain.length; i++) {
          const currentComponent = currentContext.chain[i].element || {};
          const location = createLocation(currentContext, currentContext.chain[i].route);
          runCallbackIfPossible(
            currentComponent.onAfterEnter,
            [location, {}, currentContext.resolver],
            currentComponent);
        }
      }

      __animateIfNeeded(context) {
        const from = (this.__disappearingContent || [])[0];
        const to = (this.__appearingContent || [])[0];
        const promises = [];

        const chain = context.chain;
        let config;
        for (let i = chain.length; i > 0; i--) {
          if (chain[i - 1].route.animate) {
            config = chain[i - 1].route.animate;
            break;
          }
        }

        if (from && to && config) {
          const leave = isObject(config) && config.leave || 'leaving';
          const enter = isObject(config) && config.enter || 'entering';
          promises.push(animate(from, leave));
          promises.push(animate(to, enter));
        }

        return Promise.all(promises).then(() => context);
      }

      /**
       * Subscribes this instance to navigation events on the `window`.
       *
       * NOTE: beware of resource leaks. For as long as a router instance is
       * subscribed to navigation events, it won't be garbage collected.
       */
      subscribe() {
        window.addEventListener('vaadin-router-go', this.__navigationEventHandler);
      }

      /**
       * Removes the subscription to navigation events created in the `subscribe()`
       * method.
       */
      unsubscribe() {
        window.removeEventListener('vaadin-router-go', this.__navigationEventHandler);
      }

      __onNavigationEvent(event) {
        const pathname = event ? event.detail.pathname : window.location.pathname;
        this.render(pathname, true);
      }

      /**
       * Configures what triggers Vaadin.Router navigation events:
       *  - `POPSTATE`: popstate events on the current `window`
       *  - `CLICK`: click events on `<a>` links leading to the current page
       *
       * This method is invoked with the pre-configured values when creating a new Router instance.
       * By default, both `POPSTATE` and `CLICK` are enabled. This setup is expected to cover most of the use cases.
       *
       * See the `router-config.js` for the default navigation triggers config. Based on it, you can
       * create the own one and only import the triggers you need, instead of pulling in all the code,
       * e.g. if you want to handle `click` differently.
       *
       * See also **Navigation Triggers** section in [Live Examples](#/classes/Vaadin.Router/demos/demo/index.html).
       *
       * @param {...NavigationTrigger} triggers
       */
      static setTriggers(...triggers) {
        setNavigationTriggers(triggers);
      }

      /**
       * Triggers navigation to a new path and returns without waiting until the
       * navigation is complete.
       *
       * @param {!string} pathname a new in-app path
       */
      static go(pathname) {
        fireRouterEvent('go', {pathname});
      }
    }

    const DEV_MODE_CODE_REGEXP =
      /\/\*\*\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i;

    function isMinified() {
      function test() {
        /** vaadin-dev-mode:start
        return false;
        vaadin-dev-mode:end **/
        return true;
      }
      return uncommentAndRun(test);
    }

    function isDevelopmentMode() {
      try {
        return isForcedDevelopmentMode() || (isLocalhost() && !isMinified() && !isFlowProductionMode());
      } catch (e) {
        // Some error in this code, assume production so no further actions will be taken
        return false;
      }
    }

    function isForcedDevelopmentMode() {
      return localStorage.getItem("vaadin.developmentmode.force");
    }

    function isLocalhost() {
      return (["localhost","127.0.0.1"].indexOf(window.location.hostname) >= 0);
    }

    function isFlowProductionMode() {
      if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
        const productionModeApps = Object.keys(window.Vaadin.Flow.clients)
        .map(key => window.Vaadin.Flow.clients[key])
        .filter(client => client.productionMode);
        if (productionModeApps.length > 0) {
          return true;
        }
      }
      return false;
    }

    function uncommentAndRun(callback, args) {
      if (typeof callback !== 'function') {
        return;
      }

      const match = DEV_MODE_CODE_REGEXP.exec(callback.toString());
      if (match) {
        try {
          // requires CSP: script-src 'unsafe-eval'
          callback = new Function(match[1]);
        } catch (e) {
          // eat the exception
          console.log('vaadin-development-mode-detector: uncommentAndRun() failed', e);
        }
      }

      return callback(args);
    }

    // A guard against polymer-modulizer removing the window.Vaadin
    // initialization above.
    window['Vaadin'] = window['Vaadin'] || {};

    /**
     * Inspects the source code of the given `callback` function for
     * specially-marked _commented_ code. If such commented code is found in the
     * callback source, uncomments and runs that code instead of the callback
     * itself. Otherwise runs the callback as is.
     *
     * The optional arguments are passed into the callback / uncommented code,
     * the result is returned.
     *
     * See the `isMinified()` function source code in this file for an example.
     *
     */
    const runIfDevelopmentMode = function(callback, args) {
      if (window.Vaadin.developmentMode) {
        return uncommentAndRun(callback, args);
      }
    };

    if (window.Vaadin.developmentMode === undefined) {
      window.Vaadin.developmentMode = isDevelopmentMode();
    }

    /* This file is autogenerated from src/vaadin-usage-statistics.tpl.html */

    function maybeGatherAndSendStats() {
      /** vaadin-dev-mode:start
      (function () {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var getPolymerVersion = function getPolymerVersion() {
      return window.Polymer && window.Polymer.version;
    };

    var StatisticsGatherer = function () {
      function StatisticsGatherer(logger) {
        classCallCheck(this, StatisticsGatherer);

        this.now = new Date().getTime();
        this.logger = logger;
      }

      createClass(StatisticsGatherer, [{
        key: 'frameworkVersionDetectors',
        value: function frameworkVersionDetectors() {
          return {
            'Flow': function Flow() {
              if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
                var flowVersions = Object.keys(window.Vaadin.Flow.clients).map(function (key) {
                  return window.Vaadin.Flow.clients[key];
                }).filter(function (client) {
                  return client.getVersionInfo;
                }).map(function (client) {
                  return client.getVersionInfo().flow;
                });
                if (flowVersions.length > 0) {
                  return flowVersions[0];
                }
              }
            },
            'Vaadin Framework': function VaadinFramework() {
              if (window.vaadin && window.vaadin.clients) {
                var frameworkVersions = Object.values(window.vaadin.clients).filter(function (client) {
                  return client.getVersionInfo;
                }).map(function (client) {
                  return client.getVersionInfo().vaadinVersion;
                });
                if (frameworkVersions.length > 0) {
                  return frameworkVersions[0];
                }
              }
            },
            'AngularJs': function AngularJs() {
              if (window.angular && window.angular.version && window.angular.version) {
                return window.angular.version.full;
              }
            },
            'Angular': function Angular() {
              if (window.ng) {
                var tags = document.querySelectorAll("[ng-version]");
                if (tags.length > 0) {
                  return tags[0].getAttribute("ng-version");
                }
                return "Unknown";
              }
            },
            'Backbone.js': function BackboneJs() {
              if (window.Backbone) {
                return window.Backbone.VERSION;
              }
            },
            'React': function React() {
              var reactSelector = '[data-reactroot], [data-reactid]';
              if (!!document.querySelector(reactSelector)) {
                // React does not publish the version by default
                return "unknown";
              }
            },
            'Ember': function Ember() {
              if (window.Em && window.Em.VERSION) {
                return window.Em.VERSION;
              } else if (window.Ember && window.Ember.VERSION) {
                return window.Ember.VERSION;
              }
            },
            'jQuery': function (_jQuery) {
              function jQuery() {
                return _jQuery.apply(this, arguments);
              }

              jQuery.toString = function () {
                return _jQuery.toString();
              };

              return jQuery;
            }(function () {
              if (typeof jQuery === 'function' && jQuery.prototype.jquery !== undefined) {
                return jQuery.prototype.jquery;
              }
            }),
            'Polymer': function Polymer() {
              var version = getPolymerVersion();
              if (version) {
                return version;
              }
            },
            'Vue.js': function VueJs() {
              if (window.Vue) {
                return window.Vue.version;
              }
            }
          };
        }
      }, {
        key: 'getUsedVaadinElements',
        value: function getUsedVaadinElements(elements) {
          var version = getPolymerVersion();
          var elementClasses = void 0;
          if (version && version.indexOf('2') === 0) {
            // Polymer 2: components classes are stored in window.Vaadin
            elementClasses = Object.keys(window.Vaadin).map(function (c) {
              return window.Vaadin[c];
            }).filter(function (c) {
              return c.is;
            });
          } else {
            // Polymer 3: components classes are stored in window.Vaadin.registrations
            elementClasses = window.Vaadin.registrations || [];
          }
          elementClasses.forEach(function (klass) {
            var version = klass.version ? klass.version : "0.0.0";
            elements[klass.is] = { version: version };
          });
        }
      }, {
        key: 'getUsedVaadinThemes',
        value: function getUsedVaadinThemes(themes) {
          ['Lumo', 'Material'].forEach(function (themeName) {
            var theme;
            var version = getPolymerVersion();
            if (version && version.indexOf('2') === 0) {
              // Polymer 2: themes are stored in window.Vaadin
              theme = window.Vaadin[themeName];
            } else {
              // Polymer 3: themes are stored in custom element registry
              theme = customElements.get('vaadin-' + themeName.toLowerCase() + '-styles');
            }
            if (theme && theme.version) {
              themes[themeName] = { version: theme.version };
            }
          });
        }
      }, {
        key: 'getFrameworks',
        value: function getFrameworks(frameworks) {
          var detectors = this.frameworkVersionDetectors();
          Object.keys(detectors).forEach(function (framework) {
            var detector = detectors[framework];
            try {
              var version = detector();
              if (version) {
                frameworks[framework] = { "version": version };
              }
            } catch (e) {}
          });
        }
      }, {
        key: 'gather',
        value: function gather(storage) {
          var storedStats = storage.read();
          var gatheredStats = {};
          var types = ["elements", "frameworks", "themes"];

          types.forEach(function (type) {
            gatheredStats[type] = {};
            if (!storedStats[type]) {
              storedStats[type] = {};
            }
          });

          var previousStats = JSON.stringify(storedStats);

          this.getUsedVaadinElements(gatheredStats.elements);
          this.getFrameworks(gatheredStats.frameworks);
          this.getUsedVaadinThemes(gatheredStats.themes);

          var now = this.now;
          types.forEach(function (type) {
            var keys = Object.keys(gatheredStats[type]);
            keys.forEach(function (key) {
              if (!storedStats[type][key] || _typeof(storedStats[type][key]) != _typeof({})) {
                storedStats[type][key] = { "firstUsed": now };
              }
              // Discards any previously logged version numebr
              storedStats[type][key].version = gatheredStats[type][key].version;
              storedStats[type][key].lastUsed = now;
            });
          });

          var newStats = JSON.stringify(storedStats);
          storage.write(newStats);
          if (newStats != previousStats && Object.keys(storedStats).length > 0) {
            this.logger.debug("New stats: " + newStats);
          }
        }
      }]);
      return StatisticsGatherer;
    }();

    var StatisticsStorage = function () {
      function StatisticsStorage(key) {
        classCallCheck(this, StatisticsStorage);

        this.key = key;
      }

      createClass(StatisticsStorage, [{
        key: 'read',
        value: function read() {
          var localStorageStatsString = localStorage.getItem(this.key);
          try {
            return JSON.parse(localStorageStatsString ? localStorageStatsString : '{}');
          } catch (e) {
            return {};
          }
        }
      }, {
        key: 'write',
        value: function write(data) {
          localStorage.setItem(this.key, data);
        }
      }, {
        key: 'clear',
        value: function clear() {
          localStorage.removeItem(this.key);
        }
      }, {
        key: 'isEmpty',
        value: function isEmpty() {
          var storedStats = this.read();
          var empty = true;
          Object.keys(storedStats).forEach(function (key) {
            if (Object.keys(storedStats[key]).length > 0) {
              empty = false;
            }
          });

          return empty;
        }
      }]);
      return StatisticsStorage;
    }();

    var StatisticsSender = function () {
      function StatisticsSender(url, logger) {
        classCallCheck(this, StatisticsSender);

        this.url = url;
        this.logger = logger;
      }

      createClass(StatisticsSender, [{
        key: 'send',
        value: function send(data, errorHandler) {
          var logger = this.logger;

          if (navigator.onLine === false) {
            logger.debug("Offline, can't send");
            errorHandler();
            return;
          }
          logger.debug("Sending data to " + this.url);

          var req = new XMLHttpRequest();
          req.withCredentials = true;
          req.addEventListener("load", function () {
            // Stats sent, nothing more to do
            logger.debug("Response: " + req.responseText);
          });
          req.addEventListener("error", function () {
            logger.debug("Send failed");
            errorHandler();
          });
          req.addEventListener("abort", function () {
            logger.debug("Send aborted");
            errorHandler();
          });
          req.open("POST", this.url);
          req.setRequestHeader("Content-Type", "application/json");
          req.send(data);
        }
      }]);
      return StatisticsSender;
    }();

    var StatisticsLogger = function () {
      function StatisticsLogger(id) {
        classCallCheck(this, StatisticsLogger);

        this.id = id;
      }

      createClass(StatisticsLogger, [{
        key: '_isDebug',
        value: function _isDebug() {
          return localStorage.getItem("vaadin." + this.id + ".debug");
        }
      }, {
        key: 'debug',
        value: function debug(msg) {
          if (this._isDebug()) {
            console.info(this.id + ": " + msg);
          }
        }
      }]);
      return StatisticsLogger;
    }();

    var UsageStatistics = function () {
      function UsageStatistics() {
        classCallCheck(this, UsageStatistics);

        this.now = new Date();
        this.timeNow = this.now.getTime();
        this.gatherDelay = 10; // Delay between loading this file and gathering stats
        this.initialDelay = 24 * 60 * 60;

        this.logger = new StatisticsLogger("statistics");
        this.storage = new StatisticsStorage("vaadin.statistics.basket");
        this.gatherer = new StatisticsGatherer(this.logger);
        this.sender = new StatisticsSender("https://tools.vaadin.com/usage-stats/submit", this.logger);
      }

      createClass(UsageStatistics, [{
        key: 'maybeGatherAndSend',
        value: function maybeGatherAndSend() {
          var _this = this;

          if (localStorage.getItem(UsageStatistics.optOutKey)) {
            return;
          }
          this.gatherer.gather(this.storage);
          setTimeout(function () {
            _this.maybeSend();
          }, this.gatherDelay * 1000);
        }
      }, {
        key: 'lottery',
        value: function lottery() {
          return Math.random() <= 0.05;
        }
      }, {
        key: 'currentMonth',
        value: function currentMonth() {
          return this.now.getYear() * 12 + this.now.getMonth();
        }
      }, {
        key: 'maybeSend',
        value: function maybeSend() {
          var firstUse = Number(localStorage.getItem(UsageStatistics.firstUseKey));
          var monthProcessed = Number(localStorage.getItem(UsageStatistics.monthProcessedKey));

          if (!firstUse) {
            // Use a grace period to avoid interfering with tests, incognito mode etc
            firstUse = this.timeNow;
            localStorage.setItem(UsageStatistics.firstUseKey, firstUse);
          }

          if (this.timeNow < firstUse + this.initialDelay * 1000) {
            this.logger.debug("No statistics will be sent until the initial delay of " + this.initialDelay + "s has passed");
            return;
          }
          if (this.currentMonth() <= monthProcessed) {
            this.logger.debug("This month has already been processed");
            return;
          }
          localStorage.setItem(UsageStatistics.monthProcessedKey, this.currentMonth());
          // Use random sampling
          if (this.lottery()) {
            this.logger.debug("Congratulations, we have a winner!");
          } else {
            this.logger.debug("Sorry, no stats from you this time");
            return;
          }

          this.send();
        }
      }, {
        key: 'send',
        value: function send() {
          // Ensure we have the latest data
          this.gatherer.gather(this.storage);

          // Read, send and clean up
          var data = this.storage.read();
          data["firstUse"] = Number(localStorage.getItem(UsageStatistics.firstUseKey));
          data["usageStatisticsVersion"] = UsageStatistics.version;
          var info = 'This request contains usage statistics gathered from the application running in development mode. \n\nStatistics gathering is automatically disabled and excluded from production builds.\n\nFor details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.\n\n\n\n';
          var self = this;
          this.sender.send(info + JSON.stringify(data), function () {
            // Revert the 'month processed' flag
            localStorage.setItem(UsageStatistics.monthProcessedKey, self.currentMonth() - 1);
          });
        }
      }], [{
        key: 'version',
        get: function get$1() {
          return '2.0.1';
        }
      }, {
        key: 'firstUseKey',
        get: function get$1() {
          return 'vaadin.statistics.firstuse';
        }
      }, {
        key: 'monthProcessedKey',
        get: function get$1() {
          return 'vaadin.statistics.monthProcessed';
        }
      }, {
        key: 'optOutKey',
        get: function get$1() {
          return 'vaadin.statistics.optout';
        }
      }]);
      return UsageStatistics;
    }();

    try {
      window.Vaadin = window.Vaadin || {};
      window.Vaadin.usageStatistics = window.Vaadin.usageStatistics || new UsageStatistics();
      window.Vaadin.usageStatistics.maybeGatherAndSend();
    } catch (e) {
      // Intentionally ignored as this is not a problem in the app being developed
    }

    }());

      vaadin-dev-mode:end **/
    }

    const usageStatistics = function() {
      if (typeof runIfDevelopmentMode === 'function') {
        return runIfDevelopmentMode(maybeGatherAndSendStats);
      }
    };

    window.Vaadin = window.Vaadin || {};
    window.Vaadin.registrations = window.Vaadin.registrations || [];

    window.Vaadin.registrations.push({
      is: '@vaadin/router',
      version: '1.1.0',
    });

    usageStatistics();

    Router.NavigationTrigger = {POPSTATE, CLICK};

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /** @type {Promise<void>} */
    let readyPromise = null;

    /** @type {?function(?function())} */
    let whenReady = window['HTMLImports'] && window['HTMLImports']['whenReady'] || null;

    /** @type {function()} */
    let resolveFn;

    /**
     * @param {?function()} callback
     */
    function documentWait(callback) {
      requestAnimationFrame(function() {
        if (whenReady) {
          whenReady(callback);
        } else {
          if (!readyPromise) {
            readyPromise = new Promise((resolve) => {resolveFn = resolve;});
            if (document.readyState === 'complete') {
              resolveFn();
            } else {
              document.addEventListener('readystatechange', () => {
                if (document.readyState === 'complete') {
                  resolveFn();
                }
              });
            }
          }
          readyPromise.then(function(){ callback && callback(); });
        }
      });
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const SEEN_MARKER = '__seenByShadyCSS';
    const CACHED_STYLE = '__shadyCSSCachedStyle';

    /** @type {?function(!HTMLStyleElement)} */
    let transformFn = null;

    /** @type {?function()} */
    let validateFn = null;

    /**
    This interface is provided to add document-level <style> elements to ShadyCSS for processing.
    These styles must be processed by ShadyCSS to simulate ShadowRoot upper-bound encapsulation from outside styles
    In addition, these styles may also need to be processed for @apply rules and CSS Custom Properties

    To add document-level styles to ShadyCSS, one can call `ShadyCSS.addDocumentStyle(styleElement)` or `ShadyCSS.addDocumentStyle({getStyle: () => styleElement})`

    In addition, if the process used to discover document-level styles can be synchronously flushed, one should set `ShadyCSS.documentStyleFlush`.
    This function will be called when calculating styles.

    An example usage of the document-level styling api can be found in `examples/document-style-lib.js`

    @unrestricted
    */
    class CustomStyleInterface {
      constructor() {
        /** @type {!Array<!CustomStyleProvider>} */
        this['customStyles'] = [];
        this['enqueued'] = false;
        // NOTE(dfreedm): use quotes here to prevent closure inlining to `function(){}`;
        documentWait(() => {
          if (window['ShadyCSS']['flushCustomStyles']) {
            window['ShadyCSS']['flushCustomStyles']();
          }
        });
      }
      /**
       * Queue a validation for new custom styles to batch style recalculations
       */
      enqueueDocumentValidation() {
        if (this['enqueued'] || !validateFn) {
          return;
        }
        this['enqueued'] = true;
        documentWait(validateFn);
      }
      /**
       * @param {!HTMLStyleElement} style
       */
      addCustomStyle(style) {
        if (!style[SEEN_MARKER]) {
          style[SEEN_MARKER] = true;
          this['customStyles'].push(style);
          this.enqueueDocumentValidation();
        }
      }
      /**
       * @param {!CustomStyleProvider} customStyle
       * @return {HTMLStyleElement}
       */
      getStyleForCustomStyle(customStyle) {
        if (customStyle[CACHED_STYLE]) {
          return customStyle[CACHED_STYLE];
        }
        let style;
        if (customStyle['getStyle']) {
          style = customStyle['getStyle']();
        } else {
          style = customStyle;
        }
        return style;
      }
      /**
       * @return {!Array<!CustomStyleProvider>}
       */
      processStyles() {
        const cs = this['customStyles'];
        for (let i = 0; i < cs.length; i++) {
          const customStyle = cs[i];
          if (customStyle[CACHED_STYLE]) {
            continue;
          }
          const style = this.getStyleForCustomStyle(customStyle);
          if (style) {
            // HTMLImports polyfill may have cloned the style into the main document,
            // which is referenced with __appliedElement.
            const styleToTransform = /** @type {!HTMLStyleElement} */(style['__appliedElement'] || style);
            if (transformFn) {
              transformFn(styleToTransform);
            }
            customStyle[CACHED_STYLE] = styleToTransform;
          }
        }
        return cs;
      }
    }

    CustomStyleInterface.prototype['addCustomStyle'] = CustomStyleInterface.prototype.addCustomStyle;
    CustomStyleInterface.prototype['getStyleForCustomStyle'] = CustomStyleInterface.prototype.getStyleForCustomStyle;
    CustomStyleInterface.prototype['processStyles'] = CustomStyleInterface.prototype.processStyles;

    Object.defineProperties(CustomStyleInterface.prototype, {
      'transformCallback': {
        /** @return {?function(!HTMLStyleElement)} */
        get() {
          return transformFn;
        },
        /** @param {?function(!HTMLStyleElement)} fn */
        set(fn) {
          transformFn = fn;
        }
      },
      'validateCallback': {
        /** @return {?function()} */
        get() {
          return validateFn;
        },
        /**
         * @param {?function()} fn
         * @this {CustomStyleInterface}
         */
        set(fn) {
          let needsEnqueue = false;
          if (!validateFn) {
            needsEnqueue = true;
          }
          validateFn = fn;
          if (needsEnqueue) {
            this.enqueueDocumentValidation();
          }
        },
      }
    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const VAR_ASSIGN = /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi;
    const MIXIN_MATCH = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi;
    const MEDIA_MATCH = /@media\s(.*)/;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * @param {Element} element
     * @param {Object=} properties
     */
    function updateNativeProperties(element, properties) {
      // remove previous properties
      for (let p in properties) {
        // NOTE: for bc with shim, don't apply null values.
        if (p === null) {
          element.style.removeProperty(p);
        } else {
          element.style.setProperty(p, properties[p]);
        }
      }
    }

    /**
     * @param {Element} element
     * @param {string} property
     * @return {string}
     */
    function getComputedStyleValue(element, property) {
      /**
       * @const {string}
       */
      const value = window.getComputedStyle(element).getPropertyValue(property);
      if (!value) {
        return '';
      } else {
        return value.trim();
      }
    }

    /**
     * return true if `cssText` contains a mixin definition or consumption
     * @param {string} cssText
     * @return {boolean}
     */
    function detectMixin(cssText) {
      const has = MIXIN_MATCH.test(cssText) || VAR_ASSIGN.test(cssText);
      // reset state of the regexes
      MIXIN_MATCH.lastIndex = 0;
      VAR_ASSIGN.lastIndex = 0;
      return has;
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const nativeShadow = !(window['ShadyDOM'] && window['ShadyDOM']['inUse']);
    let nativeCssVariables_;

    /**
     * @param {(ShadyCSSOptions | ShadyCSSInterface)=} settings
     */
    function calcCssVariables(settings) {
      if (settings && settings['shimcssproperties']) {
        nativeCssVariables_ = false;
      } else {
        // chrome 49 has semi-working css vars, check if box-shadow works
        // safari 9.1 has a recalc bug: https://bugs.webkit.org/show_bug.cgi?id=155782
        // However, shim css custom properties are only supported with ShadyDOM enabled,
        // so fall back on native if we do not detect ShadyDOM
        // Edge 15: custom properties used in ::before and ::after will also be used in the parent element
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12414257/
        nativeCssVariables_ = nativeShadow || Boolean(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) &&
          window.CSS && CSS.supports && CSS.supports('box-shadow', '0 0 0 var(--foo)'));
      }
    }

    if (window.ShadyCSS && window.ShadyCSS.nativeCss !== undefined) {
      nativeCssVariables_ = window.ShadyCSS.nativeCss;
    } else if (window.ShadyCSS) {
      calcCssVariables(window.ShadyCSS);
      // reset window variable to let ShadyCSS API take its place
      window.ShadyCSS = undefined;
    } else {
      calcCssVariables(window['WebComponents'] && window['WebComponents']['flags']);
    }

    // Hack for type error under new type inference which doesn't like that
    // nativeCssVariables is updated in a function and assigns the type
    // `function(): ?` instead of `boolean`.
    const nativeCssVariables = /** @type {boolean} */(nativeCssVariables_);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const customStyleInterface = new CustomStyleInterface();

    if (!window.ShadyCSS) {
      window.ShadyCSS = {
        /**
         * @param {!HTMLTemplateElement} template
         * @param {string} elementName
         * @param {string=} elementExtends
         */
        prepareTemplate(template, elementName, elementExtends) {}, // eslint-disable-line no-unused-vars

        /**
         * @param {!HTMLTemplateElement} template
         * @param {string} elementName
         */
        prepareTemplateDom(template, elementName) {}, // eslint-disable-line no-unused-vars

        /**
         * @param {!HTMLTemplateElement} template
         * @param {string} elementName
         * @param {string=} elementExtends
         */
        prepareTemplateStyles(template, elementName, elementExtends) {}, // eslint-disable-line no-unused-vars

        /**
         * @param {Element} element
         * @param {Object=} properties
         */
        styleSubtree(element, properties) {
          customStyleInterface.processStyles();
          updateNativeProperties(element, properties);
        },

        /**
         * @param {Element} element
         */
        styleElement(element) { // eslint-disable-line no-unused-vars
          customStyleInterface.processStyles();
        },

        /**
         * @param {Object=} properties
         */
        styleDocument(properties) {
          customStyleInterface.processStyles();
          updateNativeProperties(document.body, properties);
        },

        /**
         * @param {Element} element
         * @param {string} property
         * @return {string}
         */
        getComputedStyleValue(element, property) {
          return getComputedStyleValue(element, property);
        },

        flushCustomStyles() {},
        nativeCss: nativeCssVariables,
        nativeShadow: nativeShadow
      };
    }

    window.ShadyCSS.CustomStyleInterface = customStyleInterface;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const attr = 'include';

    const CustomStyleInterface$1 = window.ShadyCSS.CustomStyleInterface;

    /**
     * Custom element for defining styles in the main document that can take
     * advantage of [shady DOM](https://github.com/webcomponents/shadycss) shims
     * for style encapsulation, custom properties, and custom mixins.
     *
     * - Document styles defined in a `<custom-style>` are shimmed to ensure they
     *   do not leak into local DOM when running on browsers without native
     *   Shadow DOM.
     * - Custom properties can be defined in a `<custom-style>`. Use the `html` selector
     *   to define custom properties that apply to all custom elements.
     * - Custom mixins can be defined in a `<custom-style>`, if you import the optional
     *   [apply shim](https://github.com/webcomponents/shadycss#about-applyshim)
     *   (`shadycss/apply-shim.html`).
     *
     * To use:
     *
     * - Import `custom-style.html`.
     * - Place a `<custom-style>` element in the main document, wrapping an inline `<style>` tag that
     *   contains the CSS rules you want to shim.
     *
     * For example:
     *
     * ```html
     * <!-- import apply shim--only required if using mixins -->
     * <link rel="import" href="bower_components/shadycss/apply-shim.html">
     * <!-- import custom-style element -->
     * <link rel="import" href="bower_components/polymer/lib/elements/custom-style.html">
     *
     * <custom-style>
     *   <style>
     *     html {
     *       --custom-color: blue;
     *       --custom-mixin: {
     *         font-weight: bold;
     *         color: red;
     *       };
     *     }
     *   </style>
     * </custom-style>
     * ```
     *
     * @customElement
     * @extends HTMLElement
     * @summary Custom element for defining styles in the main document that can
     *   take advantage of Polymer's style scoping and custom properties shims.
     */
    class CustomStyle extends HTMLElement {
      constructor() {
        super();
        this._style = null;
        CustomStyleInterface$1.addCustomStyle(this);
      }
      /**
       * Returns the light-DOM `<style>` child this element wraps.  Upon first
       * call any style modules referenced via the `include` attribute will be
       * concatenated to this element's `<style>`.
       *
       * @return {HTMLStyleElement} This element's light-DOM `<style>`
       */
      getStyle() {
        if (this._style) {
          return this._style;
        }
        const style = /** @type {HTMLStyleElement} */(this.querySelector('style'));
        if (!style) {
          return null;
        }
        this._style = style;
        const include = style.getAttribute(attr);
        if (include) {
          style.removeAttribute(attr);
          style.textContent = cssFromModules(include) + style.textContent;
        }
        /*
        HTML Imports styling the main document are deprecated in Chrome
        https://crbug.com/523952

        If this element is not in the main document, then it must be in an HTML Import document.
        In that case, move the custom style to the main document.

        The ordering of `<custom-style>` should stay the same as when loaded by HTML Imports, but there may be odd
        cases of ordering w.r.t the main document styles.
        */
        if (this.ownerDocument !== window.document) {
          window.document.head.appendChild(this);
        }
        return this._style;
      }
    }

    window.customElements.define('custom-style', CustomStyle);

    const $_documentContainer = document.createElement('template');

    $_documentContainer.innerHTML = `<custom-style>
  <style>
    :root {
      /* Base (background) */
      --parmaco-base-color: #FFF;
      --parmaco-base-color-100pct: #FFF;

      --parmaco-transparent: transparent;

      /* Tint */
      --whcg-tint-5pct: hsla(0, 0%, 100%, 0.3);
      --whcg-tint-10pct: hsla(0, 0%, 100%, 0.37);
      --whcg-tint-20pct: hsla(0, 0%, 100%, 0.44);
      --whcg-tint-30pct: hsla(0, 0%, 100%, 0.5);
      --whcg-tint-40pct: hsla(0, 0%, 100%, 0.57);
      --whcg-tint-50pct: hsla(0, 0%, 100%, 0.64);
      --whcg-tint-60pct: hsla(0, 0%, 100%, 0.7);
      --whcg-tint-70pct: hsla(0, 0%, 100%, 0.77);
      --whcg-tint-80pct: hsla(0, 0%, 100%, 0.84);
      --whcg-tint-90pct: hsla(0, 0%, 100%, 0.9);
      --whcg-tint-100pct: #FFF;

      /* Shade */
      --whcg-shade-5pct: hsla(214, 61%, 25%, 0.05);
      --whcg-shade-10pct: hsla(214, 57%, 24%, 0.1);
      --whcg-shade-20pct: hsla(214, 53%, 23%, 0.16);
      --whcg-shade-30pct: hsla(214, 50%, 22%, 0.26);
      --whcg-shade-40pct: hsla(214, 47%, 21%, 0.38);
      --whcg-shade-50pct: hsla(214, 45%, 20%, 0.5);
      --whcg-shade-60pct: hsla(214, 43%, 19%, 0.61);
      --whcg-shade-70pct: hsla(214, 42%, 18%, 0.72);
      --whcg-shade-80pct: hsla(214, 41%, 17%, 0.83);
      --whcg-shade-90pct: hsla(214, 40%, 16%, 0.94);
      --whcg-shade-100pct: hsl(214, 35%, 15%);
      

      /* Primary */
      --parmaco-primary-color-100pct: hsla(202, 100%, 38%, 1.0);
      --parmaco-primary-color-90pct: hsla(202, 100%, 38%, 0.9);
      --parmaco-primary-color-80pct: hsla(202, 100%, 38%, 0.8);
      --parmaco-primary-color-70pct: hsla(202, 100%, 38%, 0.7);
      --parmaco-primary-color-60pct: hsla(202, 100%, 38%, 0.6);
      --parmaco-primary-color-50pct: hsla(202, 100%, 38%, 0.5);
      --parmaco-primary-color-40pct: hsla(202, 100%, 38%, 0.4);
      --parmaco-primary-color-30pct: hsla(202, 100%, 38%, 0.3);
      --parmaco-primary-color-20pct: hsla(202, 100%, 38%, 0.2);
      --parmaco-primary-color-10pct: hsla(202, 100%, 38%, 0.1);
      --parmaco-primary-text-color: var(--parmaco-primary-color-100pct);
      --parmaco-primary-contrast-color: #FFF;

      /* Secondary*/
      --parmaco-secondary-color-100pct: hsla(24, 100%, 50%, 1.0);
      --parmaco-secondary-color-90pct: hsla(24, 100%, 50%, 0.9);
      --parmaco-secondary-color-80pct: hsla(24, 100%, 50%, 0.8);
      --parmaco-secondary-color-70pct: hsla(24, 100%, 50%, 0.7);
      --parmaco-secondary-color-60pct: hsla(24, 100%, 50%, 0.6);
      --parmaco-secondary-color-50pct: hsla(24, 100%, 50%, 0.5);
      --parmaco-secondary-color-40pct: hsla(24, 100%, 50%, 0.4);
      --parmaco-secondary-color-30pct: hsla(24, 100%, 50%, 0.3);
      --parmaco-secondary-color-20pct: hsla(24, 100%, 50%, 0.2);
      --parmaco-secondary-color-10pct: hsla(24, 100%, 50%, 0.1);
      --parmaco-secondary-text-color: var(--parmaco-secondary-color-100pct);
      --parmaco-secondary-contrast-color: #FFF;

      /* Tertiary*/
      --parmaco-tertiary-color-100pct: hsla(0, 0%, 34%, 1.0);
      --parmaco-tertiary-color-90pct: hsla(0, 0%, 34%, 0.9);
      --parmaco-tertiary-color-80pct: hsla(0, 0%, 34%, 0.8);
      --parmaco-tertiary-color-70pct: hsla(0, 0%, 34%, 0.7);
      --parmaco-tertiary-color-60pct: hsla(0, 0%, 34%, 0.6);
      --parmaco-tertiary-color-50pct: hsla(0, 0%, 34%, 0.5);
      --parmaco-tertiary-color-40pct: hsla(0, 0%, 34%, 0.4);
      --parmaco-tertiary-color-30pct: hsla(0, 0%, 34%, 0.3);
      --parmaco-tertiary-color-20pct: hsla(0, 0%, 34%, 0.2);
      --parmaco-tertiary-color-10pct: hsla(0, 0%, 34%, 0.1);
      --parmaco-tertiary-text-color: var(--parmaco-tertiary-color-100pct);
      --parmaco-tertiary-contrast-color: #FFF;

      /* Attention */
      --parmaco-attention-color-100pct: hsla(35, 98%, 58%, 1.0);
      --parmaco-attention-color-90pct: hsla(35, 98%, 58%, 0.9);
      --parmaco-attention-color-80pct: hsla(35, 98%, 58%, 0.8);
      --parmaco-attention-color-70pct: hsla(35, 98%, 58%, 0.7);
      --parmaco-attention-color-60pct: hsla(35, 98%, 58%, 0.6);
      --parmaco-attention-color-50pct: hsla(35, 98%, 58%, 0.5);
      --parmaco-attention-color-40pct: hsla(35, 98%, 58%, 0.4);
      --parmaco-attention-color-30pct: hsla(35, 98%, 58%, 0.3);
      --parmaco-attention-color-20pct: hsla(35, 98%, 58%, 0.2);
      --parmaco-attention-color-10pct: hsla(35, 98%, 58%, 0.1);
      --parmaco-attention-text-color: var(--parmaco-attention-color-100pct);
      --parmaco-attention-contrast-color: #FFF;

      /*Black*/
      --parmaco-black-color-100pct: hsla(0, 0%, 5%, 1.0);
      --parmaco-black-color-90pct: hsla(0, 0%, 5%, 0.9);
      --parmaco-black-color-80pct: hsla(0, 0%, 5%, 0.8);
      --parmaco-black-color-70pct: hsla(0, 0%, 5%, 0.7);
      --parmaco-black-color-60pct: hsla(0, 0%, 5%, 0.6);
      --parmaco-black-color-50pct: hsla(0, 0%, 5%, 0.5);
      --parmaco-black-color-40pct: hsla(0, 0%, 5%, 0.4);
      --parmaco-black-color-30pct: hsla(0, 0%, 5%, 0.3);
      --parmaco-black-color-20pct: hsla(0, 0%, 5%, 0.2);
      --parmaco-black-color-10pct: hsla(0, 0%, 5%, 0.1);
      --parmaco-black-text-color: var(--parmaco-black-color-100pct);
      --parmaco-black-contrast-color: var(--parmaco-white-color-100pct);

      /*White*/
      --parmaco-white-color-100pct: hsla(0, 0%, 99%, 1.0);
      --parmaco-white-color-90pct: hsla(0, 0%, 99%, 0.9);
      --parmaco-white-color-80pct: hsla(0, 0%, 99%, 0.8);
      --parmaco-white-color-70pct: hsla(0, 0%, 99%, 0.7);
      --parmaco-white-color-60pct: hsla(0, 0%, 99%, 0.6);
      --parmaco-white-color-50pct: hsla(0, 0%, 99%, 0.5);
      --parmaco-white-color-40pct: hsla(0, 0%, 99%, 0.4);
      --parmaco-white-color-30pct: hsla(0, 0%, 99%, 0.3);
      --parmaco-white-color-20pct: hsla(0, 0%, 99%, 0.2);
      --parmaco-white-color-10pct: hsla(0, 0%, 99%, 0.1);
      --parmaco-white-text-color: var(--parmaco-white-color-100pct);
      --parmaco-white-contrast-color: var(--parmaco-black-color-100pct);

      /* Success */
      --parmaco-success-color: hsl(145, 80%, 42%); /* hsl(144,82%,37%); */
      --parmaco-success-color-50pct: hsla(145, 76%, 44%, 0.55);
      --parmaco-success-color-10pct: hsla(145, 76%, 44%, 0.12);
      --parmaco-success-text-color: hsl(145, 100%, 32%);
      --parmaco-success-contrast-color: #FFF;
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer.content);



    // html {
    //   color: var(--parmaco-body-text-color);
    //   background-color: var(--parmaco-base-color);
    // }

    // h1,
    // h2,
    // h3,
    // h4,
    // h5,
    // h6 {
    //   color: var(--parmaco-header-text-color);
    // }

    // a {
    //   color: var(--parmaco-primary-text-color);
    // }

    const styleElementGrid = document.createElement('dom-module');

    styleElementGrid.innerHTML = `
  <template><style>
    .flex {
      display: flex;
    }

    .flex-row {  
      flex-direction: row;
    }

    .flex-column {  
      flex-direction: column;
    }

  </style></template>`;

    styleElementGrid.register('style-element-flex');

    const $_documentContainer$1 = document.createElement('template');

    $_documentContainer$1.innerHTML = `<custom-style>
  <style>
    @font-face {
      font-family: 'lumo-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAA6MAA0AAAAAGcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAOcAAAABoAAAAcgrApJ0dERUYAAA5UAAAAHAAAAB4AJwAtT1MvMgAAAZQAAAA/AAAAYA8TBj1jbWFwAAACIAAAAFUAAAFeF1faAWdhc3AAAA5MAAAACAAAAAgAAAAQZ2x5ZgAAAsgAAAn/AAASkPAJf5ZoZWFkAAABMAAAACwAAAA2D9VGhmhoZWEAAAFcAAAAHQAAACQHbQPHaG10eAAAAdQAAABKAAAAWhq5D01sb2NhAAACeAAAAFAAAABQUxxX6G1heHAAAAF8AAAAGAAAACAAPQBzbmFtZQAADMgAAADcAAABm/pYTdhwb3N0AAANpAAAAKgAAAGPYhXrMnjaY2BkYGAA4l09Iibx/DZfGbhZGEDgWhsjPzLNvJo5G0hxMDCBeADgBQc9eNpjYGRgYD7w/wADAwsDCDCvZmBkQAVsAFj1Az0AAAB42mNgZGBgUGcoZBBlAAEmBjQAABFqALF42mNgZv7IOIGBlYGBaSbTGQYGhn4IzfiawZiRkwEVMAqgCTA4MDC+VGQ+8P8AgwMzEIPUIMkqMDACAHWqC1sAeNoli8ENwDAMAo/WS2SG/rqLZ+owXif59JsBskJRYwQIhIN9yu2HGZCkQjddpx5dFJ1hHbxMbxfTqf7OECqlcE41f4baB33iESAAAHjaY2BgYGaAYBkGRgYQiADyGMF8FgYbIM3FwMHABISMDAovFf///f8frErhJQOE/f+JOCtYBxcDDDCCzGNkA2JmqAATkGBiQAVAO1gYhjcAAEqPDUAAAAAAAAAAAAgACAAQABgAnAFEAWoBkAG2AdwCAgI2AtAC9gMmA3YDvgQgBE4EcgTIBOQFJAWkBgAGTgasBzIHVAd2B5gHugf4CIAIsgjkCRYJSHjanVddbBvHEd7ZI+90v+RRJE+MfkmKPFmURIk/R8e0KDmQZTtSbbkp5baB+5e/osqDnT4FyIMQtHaAPLR+cNEGbVEkjVuICAIEBQr0oVD6UKMJ0tht1KRpiqYJ2qRRiwDNWxLRndkjHcq03KLk7d7s7O7c7uzMN7MMWPvHGbuds//WDrA625QafJMNsHm2zD7LWCblToGbLZcqNah4xYIzBE48FlUsUOR0BhtDUCx41IkPjhRPOiXTAHyGIJjCyTgRJ8luwSuXstgbi8Y5O7q0/MgY/h5ZXjraSTd/GtrXN3t+YeH8bN++UFCVJDUQvpEDp2unTtWo9Gcy/Vg2+wdOTEwmk5MTJwb6O+l/2qN2rlDI4UvWAgFNvqF93hdTO1UXcrCwIOrh61JDirBRdozdxU6zB1ETlZtt1UVuWx2pbB6m4Lqq4o6yWxWO/ygZMYfGuzRcDFXBKzjxqAJyys2WKvD4rDVgdew3iDrpCfeUaid9JQ1Uhy7NtejB6tBBazDUNVotATwDcKqmGOviZcnNp/nd2qCmaTs/1gbw9buDXNqtmqAeLLqfS/m6U9WlsTat9XSNlTW5GH5GMZTaKXhYtugFzc/jFzQUvvO0eJF1AQTYh1KWX2C92MimFDk6DPFCBbySiy1wYVEf0Q3jcazhTl3HV/PqGbhsGEg9bhjIG0Eu8khWgX2fP8w/IFmZuKzIqHXUWG+NlBsChz9gcsvKGn83jG0ja1ncuPLCP7CN3A/NtAkMOWbW+usbKIu9AqPSBF8T65Kzbtabo3MIDtGJ5UGBpJUxceJHrYmmmbHeegO87i/guiTYx3f4rL9HXFec9jgHNTKTEO5xwRjWdW78Xh/UXzO4rg8bv/wFn9K4bozoz2var7URA9nPNmiP53GPv/X3CFmv4pGsqCJZJGsOZX2vewX8kpU1DX+T12it2PHWn1BWjm3zLX6RDaMssi2vMIz2SdaG2kKpcgp32jK7yxd03UgaFy5gpesXdrVg82bcVovFWIOtSXUpxvoQPZIsy8ZZnpXYfjbL7mCL7E52nH2arbK72ZfYveyr6FF0mMlyMYbmPwjoDslUdhZKXhWQpxRj6QqWchWwCt6i1YtUrFWIu7uXKmrZxMEC68Dqq3YiYe9sUL1ab6yurovnGuum8KEfvpqdvBabb4+PJyK5SF/CzkUS4+ONuvit73rh93L4r4vSYtXrW3XhF+wV9IsJfmi3zVQy123mpvbH8+L0zb+1T998+QVE8C12UcohdutsEKV1wC7sBu9xSHNWXloqY2n+qM85WfFqNa9y0ul78ztvwqbgY2luTWbdAzb+DrjZSZTvn6/LhpiH8m0BYGVbabkNut90dMZpeU6v+HbnsYpmkmfj4XB8HS0e7X5THzQ2da7pI8b628SPh3eepDoc5xG+0WwQDfWz6DToOhsaaLCBXoNOcrZ5mPq+cL3aL/Z/Xrqdb7MU2h27btkWQvBNQ5isdESjIr90zjSNtHluZGm8PJU/HItGY4fzU+VyPn84Gk28s3LmzMqJs2dPwOo5Y9QwzXPxRDR6OJ8vdw4eX1ryR62cwbN9nX1DykoLaP2shfLkxCFC+CmYhZQIGrGoWE6xIBbXPrJWPOlcN2eqLMn8MVV9LGAGOZ8cc6t2JGJX3bFJnya9Oc5K2Zud9corjiNofvUeReX822q/+q1gkMvSN227OubilLEqnW11bGySFDjreSf6HKfvhIfTyx5OF/b5NntKGuR/Ftjhawo9CtVV8GYpGKL+ctBSIrz2ku049kuObTufUPDu7rag/JhQb+FSBBtBoZSy7QfDIJ4df775MkaqgBwNKUYQZqJReOo5WeY9AXhU1SXpOSNl+D70PluQAtIAK2ADkRL1iXqWQ3jywzAkCoI66Z4iMaqf4oXQbJ6gFfI5M20geFdVNayYejBmTY+M64NmTyilEo9L3Mt/OVUc7u+fjESsPqs/w7czBjex4/5wSg0og9YdUyfTU3pACapa6H6cBxwi4b5RLzk6enzfvomV6S8m/bW+Dd+VBuFdZpGHCsNL+laYBJ00A+9R3Yz7aqNC8yT0vU2pjr5toW9PMEbulRS+Te5Vjt2y2UjYvAPybk7zi5FEIkKtLSKobFGLCMwL29jej3h+kH3m1nmh2zZmMSS929ClopJ22pkPjqPzFukQjuLsSK12uv+22/pP12pHOulqqXQcjTt+vFSqdtJDc8FyvxoKykF8QqpqyUEZH2utW4RPV7pl+DRsf/QoCrF6SEaQKLWHKF//hK2rUhzzwTKbw7OLTs8oZPQ2OQQitnCIimO3VE52nBwWaR+i7RRUZmowJ7UyFJevL/+FdPugFtV+ZSfukpbKzQ0CXch5t19RJkbRGgMSGoTyh4EDiEkGN2oH+DbUE3aTjoon7J+dlpr/FlNWy0uH5//VEzVBDoxO9HwwcshEuBw1j8yz65idRaspt7yDPGM/zBA0TlEmOwy+08X2huw2XBuDehuuCWu6IBsaD/nZzIambeAoHPsQ1MWY92+E6+triyFaVwkhRTLtYsqchzQpzlUccteYSJmdCnlykezKqbhYd14rpPpRxdRSBxfCWSexmujNhhfmU5qpHN3NdnsXDqY0W2p+sHjffYtY4GIH1x88j4N7E11sIeMBMQmL8Ed/7Rl2CG8HTODMdHwGcWtanpHFPYAs3J0uzeAqpwszaOKK9H/6DM8EFGkZMA82U/oil8AMywkb7L5gZi9/2T9TOBaPxeLHCjP7O2j4DRrWIiB0AhrVMg9yqde8DHYCEvbPm0/u5TSLXYJatMBxBmsSwxw60oq6GHGT4nRELs1TryoK3kia05oVkF61xix++kWlV5EkUwuo0osWQSEgvnG6d5IMpTMWiLyX/2D3DPihLxOutGX68WST11synDjpE2VQaELMjzpwz/8ig0EM9xITMioeHQbuhXBa5GXde4H0jXuhPGRNyqFtJAmphXelyy1nSqO92sVPoJmyXaeIrRyQy0Hu3iNA4AtH7s0R8jYZ1bmL673mvNkLMWDYQdCBA68xH53txNdGLAxMI4zJeG+N4b11jYXYCJvGO/xJ9hWRqyFKYZyxKVynZJdWYPsfFWoWobzVSZAm3TDgxv6i1CVh01BXVUNUsQ1alqgw01VNU61jT6pBjAYufucdaquiJ0cMW3RJsZ1VYvENrD+ViOyIvUtYf/yeqcIWzWnmVJPPY8QSQYqjKnY2sY9R3zWmmrCGOmv4X44k8DwT7HX+Dr+KOWt3xorGiUDYzlj3zEx5vZ2IdqNb6277R/4x/4n4hn+oxaT7yaUNv6G07m18HUU5DominHZEa2j4iGvfQ/DEHt/v+obTuvSi4GxJJN4UVdoBH9ZvIrtOX2024Ik9oFx8I8GeRV1dEt+4ZaSw9wwJkNsrAjTxWvsfdvry2gB42nXOsWrCUBjF8X80WrQgnUrpdEenoOADdCp1cOkgHRvjJQT0XogRdO8jdOwz9GF8Ik/CtyZww+87N+cjwIx/Eton4YEn80Cem4fymzmVv8wjHrmYx8p/zVNeuamVpBMls25D64H8Yh7KC3Mqf5hHPPNtHiv/MU9Z8UdFQeSoEwlQFfEYo/CJp+TMgZxaoy/Ph1zo+74v32pPzUn3be5Ykukv2fr6VMXgltmiv/vezY1apbaEblOu2bNXtuOq97rrbqybqRRD40offJ03fu92V7cu4kb7Mu7l2z5DeNp9zblOQlEAhOHzX1aRRUBFEGQRQnvm4gIlKLwKkhBCY+Hbk8DYMs2fqb6QhOubhkASEjIhQ5YceQoUuaHELWUqVKlxR50GTe554JEWT7Tp8EyXHi/0GTBkxCtjJvnt/u/4o8LvYRdjPHe9iNH9/6k7c9/cd/fD/XTn7sJduiv3y/121+7mUtmXfdmXfdmXfdmXfdmXfdmXfdmXfdmX/dR+qhMHEVNbAAEAAf//AA942mNgZGBg4AFiMSBmYmAEQjUgZgHzGAAFQABVeNpjYGBgZACCq0vUOUD0tTZGfhgNADWhBIIAAA==) format('woff');
      font-weight: normal;
      font-style: normal;
    }

    html {
      --lumo-icons-angle-down: "\\e909";
      --lumo-icons-angle-left: "\\e903";
      --lumo-icons-angle-right: "\\e906";
      --lumo-icons-angle-up: "\\e904";
      --lumo-icons-arrow-down: "\\e921";
      --lumo-icons-arrow-left: "\\e920";
      --lumo-icons-arrow-right: "\\e91f";
      --lumo-icons-arrow-up: "\\e91e";
      --lumo-icons-bar-chart: "\\e91d";
      --lumo-icons-bell: "\\e91c";
      --lumo-icons-calendar: "\\e908";
      --lumo-icons-checkmark: "\\e902";
      --lumo-icons-chevron-down: "\\e91b";
      --lumo-icons-chevron-left: "\\e91a";
      --lumo-icons-chevron-right: "\\e919";
      --lumo-icons-chevron-up: "\\e918";
      --lumo-icons-clock: "\\e917";
      --lumo-icons-cog: "\\e916";
      --lumo-icons-cross: "\\e907";
      --lumo-icons-download: "\\e915";
      --lumo-icons-dropdown: "\\e905";
      --lumo-icons-edit: "\\e914";
      --lumo-icons-error: "\\e913";
      --lumo-icons-eye-disabled: "\\e901";
      --lumo-icons-eye: "\\e900";
      --lumo-icons-menu: "\\e912";
      --lumo-icons-minus: "\\e911";
      --lumo-icons-phone: "\\e910";
      --lumo-icons-play: "\\e90f";
      --lumo-icons-plus: "\\e90e";
      --lumo-icons-reload: "\\e90d";
      --lumo-icons-search: "\\e90c";
      --lumo-icons-upload: "\\e90b";
      --lumo-icons-user: "\\e90a";
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$1.content);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /** @unrestricted */
    class StyleNode {
      constructor() {
        /** @type {number} */
        this['start'] = 0;
        /** @type {number} */
        this['end'] = 0;
        /** @type {StyleNode} */
        this['previous'] = null;
        /** @type {StyleNode} */
        this['parent'] = null;
        /** @type {Array<StyleNode>} */
        this['rules'] = null;
        /** @type {string} */
        this['parsedCssText'] = '';
        /** @type {string} */
        this['cssText'] = '';
        /** @type {boolean} */
        this['atRule'] = false;
        /** @type {number} */
        this['type'] = 0;
        /** @type {string} */
        this['keyframesName'] = '';
        /** @type {string} */
        this['selector'] = '';
        /** @type {string} */
        this['parsedSelector'] = '';
      }
    }

    // given a string of css, return a simple rule tree
    /**
     * @param {string} text
     * @return {StyleNode}
     */
    function parse$1(text) {
      text = clean(text);
      return parseCss(lex(text), text);
    }

    // remove stuff we don't care about that may hinder parsing
    /**
     * @param {string} cssText
     * @return {string}
     */
    function clean(cssText) {
      return cssText.replace(RX.comments, '').replace(RX.port, '');
    }

    // super simple {...} lexer that returns a node tree
    /**
     * @param {string} text
     * @return {StyleNode}
     */
    function lex(text) {
      let root = new StyleNode();
      root['start'] = 0;
      root['end'] = text.length;
      let n = root;
      for (let i = 0, l = text.length; i < l; i++) {
        if (text[i] === OPEN_BRACE) {
          if (!n['rules']) {
            n['rules'] = [];
          }
          let p = n;
          let previous = p['rules'][p['rules'].length - 1] || null;
          n = new StyleNode();
          n['start'] = i + 1;
          n['parent'] = p;
          n['previous'] = previous;
          p['rules'].push(n);
        } else if (text[i] === CLOSE_BRACE) {
          n['end'] = i + 1;
          n = n['parent'] || root;
        }
      }
      return root;
    }

    // add selectors/cssText to node tree
    /**
     * @param {StyleNode} node
     * @param {string} text
     * @return {StyleNode}
     */
    function parseCss(node, text) {
      let t = text.substring(node['start'], node['end'] - 1);
      node['parsedCssText'] = node['cssText'] = t.trim();
      if (node['parent']) {
        let ss = node['previous'] ? node['previous']['end'] : node['parent']['start'];
        t = text.substring(ss, node['start'] - 1);
        t = _expandUnicodeEscapes(t);
        t = t.replace(RX.multipleSpaces, ' ');
        // TODO(sorvell): ad hoc; make selector include only after last ;
        // helps with mixin syntax
        t = t.substring(t.lastIndexOf(';') + 1);
        let s = node['parsedSelector'] = node['selector'] = t.trim();
        node['atRule'] = (s.indexOf(AT_START) === 0);
        // note, support a subset of rule types...
        if (node['atRule']) {
          if (s.indexOf(MEDIA_START) === 0) {
            node['type'] = types.MEDIA_RULE;
          } else if (s.match(RX.keyframesRule)) {
            node['type'] = types.KEYFRAMES_RULE;
            node['keyframesName'] =
              node['selector'].split(RX.multipleSpaces).pop();
          }
        } else {
          if (s.indexOf(VAR_START) === 0) {
            node['type'] = types.MIXIN_RULE;
          } else {
            node['type'] = types.STYLE_RULE;
          }
        }
      }
      let r$ = node['rules'];
      if (r$) {
        for (let i = 0, l = r$.length, r;
          (i < l) && (r = r$[i]); i++) {
          parseCss(r, text);
        }
      }
      return node;
    }

    /**
     * conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
     * expanded form that doesn't require trailing space `\000033`
     * @param {string} s
     * @return {string}
     */
    function _expandUnicodeEscapes(s) {
      return s.replace(/\\([0-9a-f]{1,6})\s/gi, function() {
        let code = arguments[1],
          repeat = 6 - code.length;
        while (repeat--) {
          code = '0' + code;
        }
        return '\\' + code;
      });
    }

    /**
     * stringify parsed css.
     * @param {StyleNode} node
     * @param {boolean=} preserveProperties
     * @param {string=} text
     * @return {string}
     */
    function stringify(node, preserveProperties, text = '') {
      // calc rule cssText
      let cssText = '';
      if (node['cssText'] || node['rules']) {
        let r$ = node['rules'];
        if (r$ && !_hasMixinRules(r$)) {
          for (let i = 0, l = r$.length, r;
            (i < l) && (r = r$[i]); i++) {
            cssText = stringify(r, preserveProperties, cssText);
          }
        } else {
          cssText = preserveProperties ? node['cssText'] :
            removeCustomProps(node['cssText']);
          cssText = cssText.trim();
          if (cssText) {
            cssText = '  ' + cssText + '\n';
          }
        }
      }
      // emit rule if there is cssText
      if (cssText) {
        if (node['selector']) {
          text += node['selector'] + ' ' + OPEN_BRACE + '\n';
        }
        text += cssText;
        if (node['selector']) {
          text += CLOSE_BRACE + '\n\n';
        }
      }
      return text;
    }

    /**
     * @param {Array<StyleNode>} rules
     * @return {boolean}
     */
    function _hasMixinRules(rules) {
      let r = rules[0];
      return Boolean(r) && Boolean(r['selector']) && r['selector'].indexOf(VAR_START) === 0;
    }

    /**
     * @param {string} cssText
     * @return {string}
     */
    function removeCustomProps(cssText) {
      cssText = removeCustomPropAssignment(cssText);
      return removeCustomPropApply(cssText);
    }

    /**
     * @param {string} cssText
     * @return {string}
     */
    function removeCustomPropAssignment(cssText) {
      return cssText
        .replace(RX.customProp, '')
        .replace(RX.mixinProp, '');
    }

    /**
     * @param {string} cssText
     * @return {string}
     */
    function removeCustomPropApply(cssText) {
      return cssText
        .replace(RX.mixinApply, '')
        .replace(RX.varApply, '');
    }

    /** @enum {number} */
    const types = {
      STYLE_RULE: 1,
      KEYFRAMES_RULE: 7,
      MEDIA_RULE: 4,
      MIXIN_RULE: 1000
    };

    const OPEN_BRACE = '{';
    const CLOSE_BRACE = '}';

    // helper regexp's
    const RX = {
      comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
      port: /@import[^;]*;/gim,
      customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
      mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
      mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
      varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
      keyframesRule: /^@[^\s]*keyframes/,
      multipleSpaces: /\s+/g
    };

    const VAR_START = '--';
    const MEDIA_START = '@media';
    const AT_START = '@';

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /** @type {!Set<string>} */
    const styleTextSet = new Set();

    const scopingAttribute = 'shady-unscoped';

    /**
     * Add a specifically-marked style to the document directly, and only one copy of that style.
     *
     * @param {!HTMLStyleElement} style
     * @return {undefined}
     */
    function processUnscopedStyle(style) {
      const text = style.textContent;
      if (!styleTextSet.has(text)) {
        styleTextSet.add(text);
        const newStyle = style.cloneNode(true);
        document.head.appendChild(newStyle);
      }
    }

    /**
     * Check if a style is supposed to be unscoped
     * @param {!HTMLStyleElement} style
     * @return {boolean} true if the style has the unscoping attribute
     */
    function isUnscopedStyle(style) {
      return style.hasAttribute(scopingAttribute);
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * @param {string|StyleNode} rules
     * @param {function(StyleNode)=} callback
     * @return {string}
     */
    function toCssText (rules, callback) {
      if (!rules) {
        return '';
      }
      if (typeof rules === 'string') {
        rules = parse$1(rules);
      }
      if (callback) {
        forEachRule(rules, callback);
      }
      return stringify(rules, nativeCssVariables);
    }

    /**
     * @param {HTMLStyleElement} style
     * @return {StyleNode}
     */
    function rulesForStyle(style) {
      if (!style['__cssRules'] && style.textContent) {
        style['__cssRules'] = parse$1(style.textContent);
      }
      return style['__cssRules'] || null;
    }

    /**
     * @param {StyleNode} node
     * @param {Function=} styleRuleCallback
     * @param {Function=} keyframesRuleCallback
     * @param {boolean=} onlyActiveRules
     */
    function forEachRule(node, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
      if (!node) {
        return;
      }
      let skipRules = false;
      let type = node['type'];
      if (onlyActiveRules) {
        if (type === types.MEDIA_RULE) {
          let matchMedia = node['selector'].match(MEDIA_MATCH);
          if (matchMedia) {
            // if rule is a non matching @media rule, skip subrules
            if (!window.matchMedia(matchMedia[1]).matches) {
              skipRules = true;
            }
          }
        }
      }
      if (type === types.STYLE_RULE) {
        styleRuleCallback(node);
      } else if (keyframesRuleCallback &&
        type === types.KEYFRAMES_RULE) {
        keyframesRuleCallback(node);
      } else if (type === types.MIXIN_RULE) {
        skipRules = true;
      }
      let r$ = node['rules'];
      if (r$ && !skipRules) {
        for (let i=0, l=r$.length, r; (i<l) && (r=r$[i]); i++) {
          forEachRule(r, styleRuleCallback, keyframesRuleCallback, onlyActiveRules);
        }
      }
    }

    /**
     * Walk from text[start] matching parens and
     * returns position of the outer end paren
     * @param {string} text
     * @param {number} start
     * @return {number}
     */
    function findMatchingParen(text, start) {
      let level = 0;
      for (let i=start, l=text.length; i < l; i++) {
        if (text[i] === '(') {
          level++;
        } else if (text[i] === ')') {
          if (--level === 0) {
            return i;
          }
        }
      }
      return -1;
    }

    /**
     * @param {string} str
     * @param {function(string, string, string, string)} callback
     */
    function processVariableAndFallback(str, callback) {
      // find 'var('
      let start = str.indexOf('var(');
      if (start === -1) {
        // no var?, everything is prefix
        return callback(str, '', '', '');
      }
      //${prefix}var(${inner})${suffix}
      let end = findMatchingParen(str, start + 3);
      let inner = str.substring(start + 4, end);
      let prefix = str.substring(0, start);
      // suffix may have other variables
      let suffix = processVariableAndFallback(str.substring(end + 1), callback);
      let comma = inner.indexOf(',');
      // value and fallback args should be trimmed to match in property lookup
      if (comma === -1) {
        // variable, no fallback
        return callback(prefix, inner.trim(), '', suffix);
      }
      // var(${value},${fallback})
      let value = inner.substring(0, comma).trim();
      let fallback = inner.substring(comma + 1).trim();
      return callback(prefix, value, fallback, suffix);
    }

    /**
     * @param {Element | {is: string, extends: string}} element
     * @return {{is: string, typeExtension: string}}
     */
    function getIsExtends(element) {
      let localName = element['localName'];
      let is = '', typeExtension = '';
      /*
      NOTE: technically, this can be wrong for certain svg elements
      with `-` in the name like `<font-face>`
      */
      if (localName) {
        if (localName.indexOf('-') > -1) {
          is = localName;
        } else {
          typeExtension = localName;
          is = (element.getAttribute && element.getAttribute('is')) || '';
        }
      } else {
        is = /** @type {?} */(element).is;
        typeExtension = /** @type {?} */(element).extends;
      }
      return {is, typeExtension};
    }

    /**
     * @param {Element|DocumentFragment} element
     * @return {string}
     */
    function gatherStyleText(element) {
      /** @type {!Array<string>} */
      const styleTextParts = [];
      const styles = /** @type {!NodeList<!HTMLStyleElement>} */(element.querySelectorAll('style'));
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        if (isUnscopedStyle(style)) {
          if (!nativeShadow) {
            processUnscopedStyle(style);
            style.parentNode.removeChild(style);
          }
        } else {
          styleTextParts.push(style.textContent);
          style.parentNode.removeChild(style);
        }
      }
      return styleTextParts.join('').trim();
    }

    const CSS_BUILD_ATTR = 'css-build';

    /**
     * Return the polymer-css-build "build type" applied to this element
     *
     * @param {!HTMLElement} element
     * @return {string} Can be "", "shady", or "shadow"
     */
    function getCssBuild(element) {
      if (element.__cssBuild === undefined) {
        // try attribute first, as it is the common case
        const attrValue = element.getAttribute(CSS_BUILD_ATTR);
        if (attrValue) {
          element.__cssBuild = attrValue;
        } else {
          const buildComment = getBuildComment(element);
          if (buildComment !== '') {
            // remove build comment so it is not needlessly copied into every element instance
            removeBuildComment(element);
          }
          element.__cssBuild = buildComment;
        }
      }
      return element.__cssBuild || '';
    }

    /**
     * Check if the given element, either a <template> or <style>, has been processed
     * by polymer-css-build.
     *
     * If so, then we can make a number of optimizations:
     * - polymer-css-build will decompose mixins into individual CSS Custom Properties,
     * so the ApplyShim can be skipped entirely.
     * - Under native ShadowDOM, the style text can just be copied into each instance
     * without modification
     * - If the build is "shady" and ShadyDOM is in use, the styling does not need
     * scoping beyond the shimming of CSS Custom Properties
     *
     * @param {!HTMLElement} element
     * @return {boolean}
     */
    function elementHasBuiltCss(element) {
      return getCssBuild(element) !== '';
    }

    /**
     * For templates made with tagged template literals, polymer-css-build will
     * insert a comment of the form `<!--css-build:shadow-->`
     *
     * @param {!HTMLElement} element
     * @return {string}
     */
    function getBuildComment(element) {
      const buildComment = element.localName === 'template' ? element.content.firstChild : element.firstChild;
      if (buildComment instanceof Comment) {
        const commentParts = buildComment.textContent.trim().split(':');
        if (commentParts[0] === CSS_BUILD_ATTR) {
          return commentParts[1];
        }
      }
      return '';
    }

    /**
     * @param {!HTMLElement} element
     */
    function removeBuildComment(element) {
      const buildComment = element.localName === 'template' ? element.content.firstChild : element.firstChild;
      buildComment.parentNode.removeChild(buildComment);
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const APPLY_NAME_CLEAN = /;\s*/m;
    const INITIAL_INHERIT = /^\s*(initial)|(inherit)\s*$/;
    const IMPORTANT = /\s*!important/;

    // separator used between mixin-name and mixin-property-name when producing properties
    // NOTE: plain '-' may cause collisions in user styles
    const MIXIN_VAR_SEP = '_-_';

    // map of mixin to property names
    // --foo: {border: 2px} -> {properties: {(--foo, ['border'])}, dependants: {'element-name': proto}}
    class MixinMap {
      constructor() {
        /** @type {!Object<string, !MixinMapEntry>} */
        this._map = {};
      }
      /**
       * @param {string} name
       * @param {!PropertyEntry} props
       */
      set(name, props) {
        name = name.trim();
        this._map[name] = {
          properties: props,
          dependants: {}
        };
      }
      /**
       * @param {string} name
       * @return {MixinMapEntry}
       */
      get(name) {
        name = name.trim();
        return this._map[name] || null;
      }
    }

    /**
     * Callback for when an element is marked invalid
     * @type {?function(string)}
     */
    let invalidCallback = null;

    /** @unrestricted */
    class ApplyShim {
      constructor() {
        /** @type {?string} */
        this._currentElement = null;
        /** @type {HTMLMetaElement} */
        this._measureElement = null;
        this._map = new MixinMap();
      }
      /**
       * return true if `cssText` contains a mixin definition or consumption
       * @param {string} cssText
       * @return {boolean}
       */
      detectMixin(cssText) {
        return detectMixin(cssText);
      }

      /**
       * Gather styles into one style for easier processing
       * @param {!HTMLTemplateElement} template
       * @return {HTMLStyleElement}
       */
      gatherStyles(template) {
        const styleText = gatherStyleText(template.content);
        if (styleText) {
          const style = /** @type {!HTMLStyleElement} */(document.createElement('style'));
          style.textContent = styleText;
          template.content.insertBefore(style, template.content.firstChild);
          return style;
        }
        return null;
      }
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @return {StyleNode}
       */
      transformTemplate(template, elementName) {
        if (template._gatheredStyle === undefined) {
          template._gatheredStyle = this.gatherStyles(template);
        }
        /** @type {HTMLStyleElement} */
        const style = template._gatheredStyle;
        return style ? this.transformStyle(style, elementName) : null;
      }
      /**
       * @param {!HTMLStyleElement} style
       * @param {string} elementName
       * @return {StyleNode}
       */
      transformStyle(style, elementName = '') {
        let ast = rulesForStyle(style);
        this.transformRules(ast, elementName);
        style.textContent = toCssText(ast);
        return ast;
      }
      /**
       * @param {!HTMLStyleElement} style
       * @return {StyleNode}
       */
      transformCustomStyle(style) {
        let ast = rulesForStyle(style);
        forEachRule(ast, (rule) => {
          if (rule['selector'] === ':root') {
            rule['selector'] = 'html';
          }
          this.transformRule(rule);
        });
        style.textContent = toCssText(ast);
        return ast;
      }
      /**
       * @param {StyleNode} rules
       * @param {string} elementName
       */
      transformRules(rules, elementName) {
        this._currentElement = elementName;
        forEachRule(rules, (r) => {
          this.transformRule(r);
        });
        this._currentElement = null;
      }
      /**
       * @param {!StyleNode} rule
       */
      transformRule(rule) {
        rule['cssText'] = this.transformCssText(rule['parsedCssText'], rule);
        // :root was only used for variable assignment in property shim,
        // but generates invalid selectors with real properties.
        // replace with `:host > *`, which serves the same effect
        if (rule['selector'] === ':root') {
          rule['selector'] = ':host > *';
        }
      }
      /**
       * @param {string} cssText
       * @param {!StyleNode} rule
       * @return {string}
       */
      transformCssText(cssText, rule) {
        // produce variables
        cssText = cssText.replace(VAR_ASSIGN, (matchText, propertyName, valueProperty, valueMixin) =>
          this._produceCssProperties(matchText, propertyName, valueProperty, valueMixin, rule));
        // consume mixins
        return this._consumeCssProperties(cssText, rule);
      }
      /**
       * @param {string} property
       * @return {string}
       */
      _getInitialValueForProperty(property) {
        if (!this._measureElement) {
          this._measureElement = /** @type {HTMLMetaElement} */(document.createElement('meta'));
          this._measureElement.setAttribute('apply-shim-measure', '');
          this._measureElement.style.all = 'initial';
          document.head.appendChild(this._measureElement);
        }
        return window.getComputedStyle(this._measureElement).getPropertyValue(property);
      }
      /**
       * Walk over all rules before this rule to find fallbacks for mixins
       *
       * @param {!StyleNode} startRule
       * @return {!Object}
       */
      _fallbacksFromPreviousRules(startRule) {
        // find the "top" rule
        let topRule = startRule;
        while (topRule['parent']) {
          topRule = topRule['parent'];
        }
        const fallbacks = {};
        let seenStartRule = false;
        forEachRule(topRule, (r) => {
          // stop when we hit the input rule
          seenStartRule = seenStartRule || r === startRule;
          if (seenStartRule) {
            return;
          }
          // NOTE: Only matching selectors are "safe" for this fallback processing
          // It would be prohibitive to run `matchesSelector()` on each selector,
          // so we cheat and only check if the same selector string is used, which
          // guarantees things like specificity matching
          if (r['selector'] === startRule['selector']) {
            Object.assign(fallbacks, this._cssTextToMap(r['parsedCssText']));
          }
        });
        return fallbacks;
      }
      /**
       * replace mixin consumption with variable consumption
       * @param {string} text
       * @param {!StyleNode=} rule
       * @return {string}
       */
      _consumeCssProperties(text, rule) {
        /** @type {Array} */
        let m = null;
        // loop over text until all mixins with defintions have been applied
        while((m = MIXIN_MATCH.exec(text))) {
          let matchText = m[0];
          let mixinName = m[1];
          let idx = m.index;
          // collect properties before apply to be "defaults" if mixin might override them
          // match includes a "prefix", so find the start and end positions of @apply
          let applyPos = idx + matchText.indexOf('@apply');
          let afterApplyPos = idx + matchText.length;
          // find props defined before this @apply
          let textBeforeApply = text.slice(0, applyPos);
          let textAfterApply = text.slice(afterApplyPos);
          let defaults = rule ? this._fallbacksFromPreviousRules(rule) : {};
          Object.assign(defaults, this._cssTextToMap(textBeforeApply));
          let replacement = this._atApplyToCssProperties(mixinName, defaults);
          // use regex match position to replace mixin, keep linear processing time
          text = `${textBeforeApply}${replacement}${textAfterApply}`;
          // move regex search to _after_ replacement
          MIXIN_MATCH.lastIndex = idx + replacement.length;
        }
        return text;
      }
      /**
       * produce variable consumption at the site of mixin consumption
       * `@apply` --foo; -> for all props (${propname}: var(--foo_-_${propname}, ${fallback[propname]}}))
       * Example:
       *  border: var(--foo_-_border); padding: var(--foo_-_padding, 2px)
       *
       * @param {string} mixinName
       * @param {Object} fallbacks
       * @return {string}
       */
      _atApplyToCssProperties(mixinName, fallbacks) {
        mixinName = mixinName.replace(APPLY_NAME_CLEAN, '');
        let vars = [];
        let mixinEntry = this._map.get(mixinName);
        // if we depend on a mixin before it is created
        // make a sentinel entry in the map to add this element as a dependency for when it is defined.
        if (!mixinEntry) {
          this._map.set(mixinName, {});
          mixinEntry = this._map.get(mixinName);
        }
        if (mixinEntry) {
          if (this._currentElement) {
            mixinEntry.dependants[this._currentElement] = true;
          }
          let p, parts, f;
          const properties = mixinEntry.properties;
          for (p in properties) {
            f = fallbacks && fallbacks[p];
            parts = [p, ': var(', mixinName, MIXIN_VAR_SEP, p];
            if (f) {
              parts.push(',', f.replace(IMPORTANT, ''));
            }
            parts.push(')');
            if (IMPORTANT.test(properties[p])) {
              parts.push(' !important');
            }
            vars.push(parts.join(''));
          }
        }
        return vars.join('; ');
      }

      /**
       * @param {string} property
       * @param {string} value
       * @return {string}
       */
      _replaceInitialOrInherit(property, value) {
        let match = INITIAL_INHERIT.exec(value);
        if (match) {
          if (match[1]) {
            // initial
            // replace `initial` with the concrete initial value for this property
            value = this._getInitialValueForProperty(property);
          } else {
            // inherit
            // with this purposfully illegal value, the variable will be invalid at
            // compute time (https://www.w3.org/TR/css-variables/#invalid-at-computed-value-time)
            // and for inheriting values, will behave similarly
            // we cannot support the same behavior for non inheriting values like 'border'
            value = 'apply-shim-inherit';
          }
        }
        return value;
      }

      /**
       * "parse" a mixin definition into a map of properties and values
       * cssTextToMap('border: 2px solid black') -> ('border', '2px solid black')
       * @param {string} text
       * @return {!Object<string, string>}
       */
      _cssTextToMap(text) {
        let props = text.split(';');
        let property, value;
        let out = {};
        for (let i = 0, p, sp; i < props.length; i++) {
          p = props[i];
          if (p) {
            sp = p.split(':');
            // ignore lines that aren't definitions like @media
            if (sp.length > 1) {
              property = sp[0].trim();
              // some properties may have ':' in the value, like data urls
              value = this._replaceInitialOrInherit(property, sp.slice(1).join(':'));
              out[property] = value;
            }
          }
        }
        return out;
      }

      /**
       * @param {MixinMapEntry} mixinEntry
       */
      _invalidateMixinEntry(mixinEntry) {
        if (!invalidCallback) {
          return;
        }
        for (let elementName in mixinEntry.dependants) {
          if (elementName !== this._currentElement) {
            invalidCallback(elementName);
          }
        }
      }

      /**
       * @param {string} matchText
       * @param {string} propertyName
       * @param {?string} valueProperty
       * @param {?string} valueMixin
       * @param {!StyleNode} rule
       * @return {string}
       */
      _produceCssProperties(matchText, propertyName, valueProperty, valueMixin, rule) {
        // handle case where property value is a mixin
        if (valueProperty) {
          // form: --mixin2: var(--mixin1), where --mixin1 is in the map
          processVariableAndFallback(valueProperty, (prefix, value) => {
            if (value && this._map.get(value)) {
              valueMixin = `@apply ${value};`;
            }
          });
        }
        if (!valueMixin) {
          return matchText;
        }
        let mixinAsProperties = this._consumeCssProperties('' + valueMixin, rule);
        let prefix = matchText.slice(0, matchText.indexOf('--'));
        let mixinValues = this._cssTextToMap(mixinAsProperties);
        let combinedProps = mixinValues;
        let mixinEntry = this._map.get(propertyName);
        let oldProps = mixinEntry && mixinEntry.properties;
        if (oldProps) {
          // NOTE: since we use mixin, the map of properties is updated here
          // and this is what we want.
          combinedProps = Object.assign(Object.create(oldProps), mixinValues);
        } else {
          this._map.set(propertyName, combinedProps);
        }
        let out = [];
        let p, v;
        // set variables defined by current mixin
        let needToInvalidate = false;
        for (p in combinedProps) {
          v = mixinValues[p];
          // if property not defined by current mixin, set initial
          if (v === undefined) {
            v = 'initial';
          }
          if (oldProps && !(p in oldProps)) {
            needToInvalidate = true;
          }
          out.push(`${propertyName}${MIXIN_VAR_SEP}${p}: ${v}`);
        }
        if (needToInvalidate) {
          this._invalidateMixinEntry(mixinEntry);
        }
        if (mixinEntry) {
          mixinEntry.properties = combinedProps;
        }
        // because the mixinMap is global, the mixin might conflict with
        // a different scope's simple variable definition:
        // Example:
        // some style somewhere:
        // --mixin1:{ ... }
        // --mixin2: var(--mixin1);
        // some other element:
        // --mixin1: 10px solid red;
        // --foo: var(--mixin1);
        // In this case, we leave the original variable definition in place.
        if (valueProperty) {
          prefix = `${matchText};${prefix}`;
        }
        return `${prefix}${out.join('; ')};`;
      }
    }

    /* exports */
    ApplyShim.prototype['detectMixin'] = ApplyShim.prototype.detectMixin;
    ApplyShim.prototype['transformStyle'] = ApplyShim.prototype.transformStyle;
    ApplyShim.prototype['transformCustomStyle'] = ApplyShim.prototype.transformCustomStyle;
    ApplyShim.prototype['transformRules'] = ApplyShim.prototype.transformRules;
    ApplyShim.prototype['transformRule'] = ApplyShim.prototype.transformRule;
    ApplyShim.prototype['transformTemplate'] = ApplyShim.prototype.transformTemplate;
    ApplyShim.prototype['_separator'] = MIXIN_VAR_SEP;
    Object.defineProperty(ApplyShim.prototype, 'invalidCallback', {
      /** @return {?function(string)} */
      get() {
        return invalidCallback;
      },
      /** @param {?function(string)} cb */
      set(cb) {
        invalidCallback = cb;
      }
    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * @const {!Object<string, !HTMLTemplateElement>}
     */
    const templateMap = {};

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /*
     * Utilities for handling invalidating apply-shim mixins for a given template.
     *
     * The invalidation strategy involves keeping track of the "current" version of a template's mixins, and updating that count when a mixin is invalidated.
     * The template
     */

    /** @const {string} */
    const CURRENT_VERSION = '_applyShimCurrentVersion';

    /** @const {string} */
    const NEXT_VERSION = '_applyShimNextVersion';

    /** @const {string} */
    const VALIDATING_VERSION = '_applyShimValidatingVersion';

    /**
     * @const {Promise<void>}
     */
    const promise = Promise.resolve();

    /**
     * @param {string} elementName
     */
    function invalidate(elementName){
      let template = templateMap[elementName];
      if (template) {
        invalidateTemplate(template);
      }
    }

    /**
     * This function can be called multiple times to mark a template invalid
     * and signal that the style inside must be regenerated.
     *
     * Use `startValidatingTemplate` to begin an asynchronous validation cycle.
     * During that cycle, call `templateIsValidating` to see if the template must
     * be revalidated
     * @param {HTMLTemplateElement} template
     */
    function invalidateTemplate(template) {
      // default the current version to 0
      template[CURRENT_VERSION] = template[CURRENT_VERSION] || 0;
      // ensure the "validating for" flag exists
      template[VALIDATING_VERSION] = template[VALIDATING_VERSION] || 0;
      // increment the next version
      template[NEXT_VERSION] = (template[NEXT_VERSION] || 0) + 1;
    }

    /**
     * @param {HTMLTemplateElement} template
     * @return {boolean}
     */
    function templateIsValid(template) {
      return template[CURRENT_VERSION] === template[NEXT_VERSION];
    }

    /**
     * Returns true if the template is currently invalid and `startValidating` has been called since the last invalidation.
     * If false, the template must be validated.
     * @param {HTMLTemplateElement} template
     * @return {boolean}
     */
    function templateIsValidating(template) {
      return !templateIsValid(template) && template[VALIDATING_VERSION] === template[NEXT_VERSION];
    }

    /**
     * Begin an asynchronous invalidation cycle.
     * This should be called after every validation of a template
     *
     * After one microtask, the template will be marked as valid until the next call to `invalidateTemplate`
     * @param {HTMLTemplateElement} template
     */
    function startValidatingTemplate(template) {
      // remember that the current "next version" is the reason for this validation cycle
      template[VALIDATING_VERSION] = template[NEXT_VERSION];
      // however, there only needs to be one async task to clear the counters
      if (!template._validating) {
        template._validating = true;
        promise.then(function() {
          // sync the current version to let future invalidations cause a refresh cycle
          template[CURRENT_VERSION] = template[NEXT_VERSION];
          template._validating = false;
        });
      }
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /** @const {ApplyShim} */
    const applyShim = new ApplyShim();

    class ApplyShimInterface {
      constructor() {
        /** @type {?CustomStyleInterfaceInterface} */
        this.customStyleInterface = null;
        applyShim['invalidCallback'] = invalidate;
      }
      ensure() {
        if (this.customStyleInterface) {
          return;
        }
        this.customStyleInterface = window.ShadyCSS.CustomStyleInterface;
        if (this.customStyleInterface) {
          this.customStyleInterface['transformCallback'] = (style) => {
            applyShim.transformCustomStyle(style);
          };
          this.customStyleInterface['validateCallback'] = () => {
            requestAnimationFrame(() => {
              if (this.customStyleInterface['enqueued']) {
                this.flushCustomStyles();
              }
            });
          };
        }
      }
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       */
      prepareTemplate(template, elementName) {
        this.ensure();
        if (elementHasBuiltCss(template)) {
          return;
        }
        templateMap[elementName] = template;
        let ast = applyShim.transformTemplate(template, elementName);
        // save original style ast to use for revalidating instances
        template['_styleAst'] = ast;
      }
      flushCustomStyles() {
        this.ensure();
        if (!this.customStyleInterface) {
          return;
        }
        let styles = this.customStyleInterface['processStyles']();
        if (!this.customStyleInterface['enqueued']) {
          return;
        }
        for (let i = 0; i < styles.length; i++ ) {
          let cs = styles[i];
          let style = this.customStyleInterface['getStyleForCustomStyle'](cs);
          if (style) {
            applyShim.transformCustomStyle(style);
          }
        }
        this.customStyleInterface['enqueued'] = false;
      }
      /**
       * @param {HTMLElement} element
       * @param {Object=} properties
       */
      styleSubtree(element, properties) {
        this.ensure();
        if (properties) {
          updateNativeProperties(element, properties);
        }
        if (element.shadowRoot) {
          this.styleElement(element);
          let shadowChildren = element.shadowRoot.children || element.shadowRoot.childNodes;
          for (let i = 0; i < shadowChildren.length; i++) {
            this.styleSubtree(/** @type {HTMLElement} */(shadowChildren[i]));
          }
        } else {
          let children = element.children || element.childNodes;
          for (let i = 0; i < children.length; i++) {
            this.styleSubtree(/** @type {HTMLElement} */(children[i]));
          }
        }
      }
      /**
       * @param {HTMLElement} element
       */
      styleElement(element) {
        this.ensure();
        let {is} = getIsExtends(element);
        let template = templateMap[is];
        if (template && elementHasBuiltCss(template)) {
          return;
        }
        if (template && !templateIsValid(template)) {
          // only revalidate template once
          if (!templateIsValidating(template)) {
            this.prepareTemplate(template, is);
            startValidatingTemplate(template);
          }
          // update this element instance
          let root = element.shadowRoot;
          if (root) {
            let style = /** @type {HTMLStyleElement} */(root.querySelector('style'));
            if (style) {
              // reuse the template's style ast, it has all the original css text
              style['__cssRules'] = template['_styleAst'];
              style.textContent = toCssText(template['_styleAst']);
            }
          }
        }
      }
      /**
       * @param {Object=} properties
       */
      styleDocument(properties) {
        this.ensure();
        this.styleSubtree(document.body, properties);
      }
    }

    if (!window.ShadyCSS || !window.ShadyCSS.ScopingShim) {
      const applyShimInterface = new ApplyShimInterface();
      let CustomStyleInterface$$1 = window.ShadyCSS && window.ShadyCSS.CustomStyleInterface;

      /** @suppress {duplicate} */
      window.ShadyCSS = {
        /**
         * @param {!HTMLTemplateElement} template
         * @param {string} elementName
         * @param {string=} elementExtends
         */
        prepareTemplate(template, elementName, elementExtends) { // eslint-disable-line no-unused-vars
          applyShimInterface.flushCustomStyles();
          applyShimInterface.prepareTemplate(template, elementName);
        },

        /**
         * @param {!HTMLTemplateElement} template
         * @param {string} elementName
         * @param {string=} elementExtends
         */
        prepareTemplateStyles(template, elementName, elementExtends) {
          this.prepareTemplate(template, elementName, elementExtends);
        },

        /**
         * @param {!HTMLTemplateElement} template
         * @param {string} elementName
         */
        prepareTemplateDom(template, elementName) {}, // eslint-disable-line no-unused-vars

        /**
         * @param {!HTMLElement} element
         * @param {Object=} properties
         */
        styleSubtree(element, properties) {
          applyShimInterface.flushCustomStyles();
          applyShimInterface.styleSubtree(element, properties);
        },

        /**
         * @param {!HTMLElement} element
         */
        styleElement(element) {
          applyShimInterface.flushCustomStyles();
          applyShimInterface.styleElement(element);
        },

        /**
         * @param {Object=} properties
         */
        styleDocument(properties) {
          applyShimInterface.flushCustomStyles();
          applyShimInterface.styleDocument(properties);
        },

        /**
         * @param {Element} element
         * @param {string} property
         * @return {string}
         */
        getComputedStyleValue(element, property) {
          return getComputedStyleValue(element, property);
        },

        flushCustomStyles() {
          applyShimInterface.flushCustomStyles();
        },

        nativeCss: nativeCssVariables,
        nativeShadow: nativeShadow
      };

      if (CustomStyleInterface$$1) {
        window.ShadyCSS.CustomStyleInterface = CustomStyleInterface$$1;
      }
    }

    window.ShadyCSS.ApplyShim = applyShim;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * @summary Collapse multiple callbacks into one invocation after a timer.
     */
    const Debouncer = class Debouncer {
      constructor() {
        this._asyncModule = null;
        this._callback = null;
        this._timer = null;
      }
      /**
       * Sets the scheduler; that is, a module with the Async interface,
       * a callback and optional arguments to be passed to the run function
       * from the async module.
       *
       * @param {!AsyncInterface} asyncModule Object with Async interface.
       * @param {function()} callback Callback to run.
       * @return {void}
       */
      setConfig(asyncModule, callback) {
        this._asyncModule = asyncModule;
        this._callback = callback;
        this._timer = this._asyncModule.run(() => {
          this._timer = null;
          this._callback();
        });
      }
      /**
       * Cancels an active debouncer and returns a reference to itself.
       *
       * @return {void}
       */
      cancel() {
        if (this.isActive()) {
          this._asyncModule.cancel(this._timer);
          this._timer = null;
        }
      }
      /**
       * Flushes an active debouncer and returns a reference to itself.
       *
       * @return {void}
       */
      flush() {
        if (this.isActive()) {
          this.cancel();
          this._callback();
        }
      }
      /**
       * Returns true if the debouncer is active.
       *
       * @return {boolean} True if active.
       */
      isActive() {
        return this._timer != null;
      }
      /**
       * Creates a debouncer if no debouncer is passed as a parameter
       * or it cancels an active debouncer otherwise. The following
       * example shows how a debouncer can be called multiple times within a
       * microtask and "debounced" such that the provided callback function is
       * called once. Add this method to a custom element:
       *
       * ```js
       * import {microTask} from '@polymer/polymer/lib/utils/async.js';
       * import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
       * // ...
       *
       * _debounceWork() {
       *   this._debounceJob = Debouncer.debounce(this._debounceJob,
       *       microTask, () => this._doWork());
       * }
       * ```
       *
       * If the `_debounceWork` method is called multiple times within the same
       * microtask, the `_doWork` function will be called only once at the next
       * microtask checkpoint.
       *
       * Note: In testing it is often convenient to avoid asynchrony. To accomplish
       * this with a debouncer, you can use `enqueueDebouncer` and
       * `flush`. For example, extend the above example by adding
       * `enqueueDebouncer(this._debounceJob)` at the end of the
       * `_debounceWork` method. Then in a test, call `flush` to ensure
       * the debouncer has completed.
       *
       * @param {Debouncer?} debouncer Debouncer object.
       * @param {!AsyncInterface} asyncModule Object with Async interface
       * @param {function()} callback Callback to run.
       * @return {!Debouncer} Returns a debouncer object.
       */
      static debounce(debouncer, asyncModule, callback) {
        if (debouncer instanceof Debouncer) {
          debouncer.cancel();
        } else {
          debouncer = new Debouncer();
        }
        debouncer.setConfig(asyncModule, callback);
        return debouncer;
      }
    };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // detect native touch action support
    let HAS_NATIVE_TA = typeof document.head.style.touchAction === 'string';
    let GESTURE_KEY = '__polymerGestures';
    let HANDLED_OBJ = '__polymerGesturesHandled';
    let TOUCH_ACTION = '__polymerGesturesTouchAction';
    // radius for tap and track
    let TAP_DISTANCE = 25;
    let TRACK_DISTANCE = 5;
    // number of last N track positions to keep
    let TRACK_LENGTH = 2;

    // Disabling "mouse" handlers for 2500ms is enough
    let MOUSE_TIMEOUT = 2500;
    let MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'click'];
    // an array of bitmask values for mapping MouseEvent.which to MouseEvent.buttons
    let MOUSE_WHICH_TO_BUTTONS = [0, 1, 4, 2];
    let MOUSE_HAS_BUTTONS = (function() {
      try {
        return new MouseEvent('test', {buttons: 1}).buttons === 1;
      } catch (e) {
        return false;
      }
    })();

    /**
     * @param {string} name Possible mouse event name
     * @return {boolean} true if mouse event, false if not
     */
    function isMouseEvent(name) {
      return MOUSE_EVENTS.indexOf(name) > -1;
    }

    /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
    // check for passive event listeners
    let SUPPORTS_PASSIVE = false;
    (function() {
      try {
        let opts = Object.defineProperty({}, 'passive', {get() {SUPPORTS_PASSIVE = true;}});
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
      } catch(e) {}
    })();

    /**
     * Generate settings for event listeners, dependant on `passiveTouchGestures`
     *
     * @param {string} eventName Event name to determine if `{passive}` option is
     *   needed
     * @return {{passive: boolean} | undefined} Options to use for addEventListener
     *   and removeEventListener
     */
    function PASSIVE_TOUCH(eventName) {
      if (isMouseEvent(eventName) || eventName === 'touchend') {
        return;
      }
      if (HAS_NATIVE_TA && SUPPORTS_PASSIVE && passiveTouchGestures) {
        return {passive: true};
      } else {
        return;
      }
    }

    // Check for touch-only devices
    let IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);

    // keep track of any labels hit by the mouseCanceller
    /** @type {!Array<!HTMLLabelElement>} */
    const clickedLabels = [];

    /** @type {!Object<boolean>} */
    const labellable = {
      'button': true,
      'input': true,
      'keygen': true,
      'meter': true,
      'output': true,
      'textarea': true,
      'progress': true,
      'select': true
    };

    // Defined at https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute
    /** @type {!Object<boolean>} */
    const canBeDisabled = {
      'button': true,
      'command': true,
      'fieldset': true,
      'input': true,
      'keygen': true,
      'optgroup': true,
      'option': true,
      'select': true,
      'textarea': true
    };

    /**
     * @param {HTMLElement} el Element to check labelling status
     * @return {boolean} element can have labels
     */
    function canBeLabelled(el) {
      return labellable[el.localName] || false;
    }

    /**
     * @param {HTMLElement} el Element that may be labelled.
     * @return {!Array<!HTMLLabelElement>} Relevant label for `el`
     */
    function matchingLabels(el) {
      let labels = Array.prototype.slice.call(/** @type {HTMLInputElement} */(el).labels || []);
      // IE doesn't have `labels` and Safari doesn't populate `labels`
      // if element is in a shadowroot.
      // In this instance, finding the non-ancestor labels is enough,
      // as the mouseCancellor code will handle ancstor labels
      if (!labels.length) {
        labels = [];
        let root = el.getRootNode();
        // if there is an id on `el`, check for all labels with a matching `for` attribute
        if (el.id) {
          let matching = root.querySelectorAll(`label[for = ${el.id}]`);
          for (let i = 0; i < matching.length; i++) {
            labels.push(/** @type {!HTMLLabelElement} */(matching[i]));
          }
        }
      }
      return labels;
    }

    // touch will make synthetic mouse events
    // `preventDefault` on touchend will cancel them,
    // but this breaks `<input>` focus and link clicks
    // disable mouse handlers for MOUSE_TIMEOUT ms after
    // a touchend to ignore synthetic mouse events
    let mouseCanceller = function(mouseEvent) {
      // Check for sourceCapabilities, used to distinguish synthetic events
      // if mouseEvent did not come from a device that fires touch events,
      // it was made by a real mouse and should be counted
      // http://wicg.github.io/InputDeviceCapabilities/#dom-inputdevicecapabilities-firestouchevents
      let sc = mouseEvent.sourceCapabilities;
      if (sc && !sc.firesTouchEvents) {
        return;
      }
      // skip synthetic mouse events
      mouseEvent[HANDLED_OBJ] = {skip: true};
      // disable "ghost clicks"
      if (mouseEvent.type === 'click') {
        let clickFromLabel = false;
        let path = mouseEvent.composedPath && mouseEvent.composedPath();
        if (path) {
          for (let i = 0; i < path.length; i++) {
            if (path[i].nodeType === Node.ELEMENT_NODE) {
              if (path[i].localName === 'label') {
                clickedLabels.push(path[i]);
              } else if (canBeLabelled(path[i])) {
                let ownerLabels = matchingLabels(path[i]);
                // check if one of the clicked labels is labelling this element
                for (let j = 0; j < ownerLabels.length; j++) {
                  clickFromLabel = clickFromLabel || clickedLabels.indexOf(ownerLabels[j]) > -1;
                }
              }
            }
            if (path[i] === POINTERSTATE.mouse.target) {
              return;
            }
          }
        }
        // if one of the clicked labels was labelling the target element,
        // this is not a ghost click
        if (clickFromLabel) {
          return;
        }
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
      }
    };

    /**
     * @param {boolean=} setup True to add, false to remove.
     * @return {void}
     */
    function setupTeardownMouseCanceller(setup) {
      let events = IS_TOUCH_ONLY ? ['click'] : MOUSE_EVENTS;
      for (let i = 0, en; i < events.length; i++) {
        en = events[i];
        if (setup) {
          // reset clickLabels array
          clickedLabels.length = 0;
          document.addEventListener(en, mouseCanceller, true);
        } else {
          document.removeEventListener(en, mouseCanceller, true);
        }
      }
    }

    function ignoreMouse(e) {
      if (!POINTERSTATE.mouse.mouseIgnoreJob) {
        setupTeardownMouseCanceller(true);
      }
      let unset = function() {
        setupTeardownMouseCanceller();
        POINTERSTATE.mouse.target = null;
        POINTERSTATE.mouse.mouseIgnoreJob = null;
      };
      POINTERSTATE.mouse.target = e.composedPath()[0];
      POINTERSTATE.mouse.mouseIgnoreJob = Debouncer.debounce(
            POINTERSTATE.mouse.mouseIgnoreJob
          , timeOut.after(MOUSE_TIMEOUT)
          , unset);
    }

    /**
     * @param {MouseEvent} ev event to test for left mouse button down
     * @return {boolean} has left mouse button down
     */
    function hasLeftMouseButton(ev) {
      let type = ev.type;
      // exit early if the event is not a mouse event
      if (!isMouseEvent(type)) {
        return false;
      }
      // ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
      // instead we use ev.buttons (bitmask of buttons) or fall back to ev.which (deprecated, 0 for no buttons, 1 for left button)
      if (type === 'mousemove') {
        // allow undefined for testing events
        let buttons = ev.buttons === undefined ? 1 : ev.buttons;
        if ((ev instanceof window.MouseEvent) && !MOUSE_HAS_BUTTONS) {
          buttons = MOUSE_WHICH_TO_BUTTONS[ev.which] || 0;
        }
        // buttons is a bitmask, check that the left button bit is set (1)
        return Boolean(buttons & 1);
      } else {
        // allow undefined for testing events
        let button = ev.button === undefined ? 0 : ev.button;
        // ev.button is 0 in mousedown/mouseup/click for left button activation
        return button === 0;
      }
    }

    function isSyntheticClick(ev) {
      if (ev.type === 'click') {
        // ev.detail is 0 for HTMLElement.click in most browsers
        if (ev.detail === 0) {
          return true;
        }
        // in the worst case, check that the x/y position of the click is within
        // the bounding box of the target of the event
        // Thanks IE 10 >:(
        let t = _findOriginalTarget(ev);
        // make sure the target of the event is an element so we can use getBoundingClientRect,
        // if not, just assume it is a synthetic click
        if (!t.nodeType || /** @type {Element} */(t).nodeType !== Node.ELEMENT_NODE) {
          return true;
        }
        let bcr = /** @type {Element} */(t).getBoundingClientRect();
        // use page x/y to account for scrolling
        let x = ev.pageX, y = ev.pageY;
        // ev is a synthetic click if the position is outside the bounding box of the target
        return !((x >= bcr.left && x <= bcr.right) && (y >= bcr.top && y <= bcr.bottom));
      }
      return false;
    }

    let POINTERSTATE = {
      mouse: {
        target: null,
        mouseIgnoreJob: null
      },
      touch: {
        x: 0,
        y: 0,
        id: -1,
        scrollDecided: false
      }
    };

    function firstTouchAction(ev) {
      let ta = 'auto';
      let path = ev.composedPath && ev.composedPath();
      if (path) {
        for (let i = 0, n; i < path.length; i++) {
          n = path[i];
          if (n[TOUCH_ACTION]) {
            ta = n[TOUCH_ACTION];
            break;
          }
        }
      }
      return ta;
    }

    function trackDocument(stateObj, movefn, upfn) {
      stateObj.movefn = movefn;
      stateObj.upfn = upfn;
      document.addEventListener('mousemove', movefn);
      document.addEventListener('mouseup', upfn);
    }

    function untrackDocument(stateObj) {
      document.removeEventListener('mousemove', stateObj.movefn);
      document.removeEventListener('mouseup', stateObj.upfn);
      stateObj.movefn = null;
      stateObj.upfn = null;
    }

    // use a document-wide touchend listener to start the ghost-click prevention mechanism
    // Use passive event listeners, if supported, to not affect scrolling performance
    document.addEventListener('touchend', ignoreMouse, SUPPORTS_PASSIVE ? {passive: true} : false);

    const gestures = {};
    const recognizers = [];

    /**
     * Finds the element rendered on the screen at the provided coordinates.
     *
     * Similar to `document.elementFromPoint`, but pierces through
     * shadow roots.
     *
     * @param {number} x Horizontal pixel coordinate
     * @param {number} y Vertical pixel coordinate
     * @return {Element} Returns the deepest shadowRoot inclusive element
     * found at the screen position given.
     */
    function deepTargetFind(x, y) {
      let node = document.elementFromPoint(x, y);
      let next = node;
      // this code path is only taken when native ShadowDOM is used
      // if there is a shadowroot, it may have a node at x/y
      // if there is not a shadowroot, exit the loop
      while (next && next.shadowRoot && !window.ShadyDOM) {
        // if there is a node at x/y in the shadowroot, look deeper
        let oldNext = next;
        next = next.shadowRoot.elementFromPoint(x, y);
        // on Safari, elementFromPoint may return the shadowRoot host
        if (oldNext === next) {
          break;
        }
        if (next) {
          node = next;
        }
      }
      return node;
    }

    /**
     * a cheaper check than ev.composedPath()[0];
     *
     * @private
     * @param {Event|Touch} ev Event.
     * @return {EventTarget} Returns the event target.
     */
    function _findOriginalTarget(ev) {
      // shadowdom
      if (ev.composedPath) {
        const targets = /** @type {!Array<!EventTarget>} */(ev.composedPath());
        // It shouldn't be, but sometimes targets is empty (window on Safari).
        return targets.length > 0 ? targets[0] : ev.target;
      }
      // shadydom
      return ev.target;
    }

    /**
     * @private
     * @param {Event} ev Event.
     * @return {void}
     */
    function _handleNative(ev) {
      let handled;
      let type = ev.type;
      let node = ev.currentTarget;
      let gobj = node[GESTURE_KEY];
      if (!gobj) {
        return;
      }
      let gs = gobj[type];
      if (!gs) {
        return;
      }
      if (!ev[HANDLED_OBJ]) {
        ev[HANDLED_OBJ] = {};
        if (type.slice(0, 5) === 'touch') {
          ev = /** @type {TouchEvent} */(ev); // eslint-disable-line no-self-assign
          let t = ev.changedTouches[0];
          if (type === 'touchstart') {
            // only handle the first finger
            if (ev.touches.length === 1) {
              POINTERSTATE.touch.id = t.identifier;
            }
          }
          if (POINTERSTATE.touch.id !== t.identifier) {
            return;
          }
          if (!HAS_NATIVE_TA) {
            if (type === 'touchstart' || type === 'touchmove') {
              _handleTouchAction(ev);
            }
          }
        }
      }
      handled = ev[HANDLED_OBJ];
      // used to ignore synthetic mouse events
      if (handled.skip) {
        return;
      }
      // reset recognizer state
      for (let i = 0, r; i < recognizers.length; i++) {
        r = recognizers[i];
        if (gs[r.name] && !handled[r.name]) {
          if (r.flow && r.flow.start.indexOf(ev.type) > -1 && r.reset) {
            r.reset();
          }
        }
      }
      // enforce gesture recognizer order
      for (let i = 0, r; i < recognizers.length; i++) {
        r = recognizers[i];
        if (gs[r.name] && !handled[r.name]) {
          handled[r.name] = true;
          r[type](ev);
        }
      }
    }

    /**
     * @private
     * @param {TouchEvent} ev Event.
     * @return {void}
     */
    function _handleTouchAction(ev) {
      let t = ev.changedTouches[0];
      let type = ev.type;
      if (type === 'touchstart') {
        POINTERSTATE.touch.x = t.clientX;
        POINTERSTATE.touch.y = t.clientY;
        POINTERSTATE.touch.scrollDecided = false;
      } else if (type === 'touchmove') {
        if (POINTERSTATE.touch.scrollDecided) {
          return;
        }
        POINTERSTATE.touch.scrollDecided = true;
        let ta = firstTouchAction(ev);
        let shouldPrevent = false;
        let dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
        let dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
        if (!ev.cancelable) ; else if (ta === 'none') {
          shouldPrevent = true;
        } else if (ta === 'pan-x') {
          shouldPrevent = dy > dx;
        } else if (ta === 'pan-y') {
          shouldPrevent = dx > dy;
        }
        if (shouldPrevent) {
          ev.preventDefault();
        } else {
          prevent('track');
        }
      }
    }

    /**
     * Adds an event listener to a node for the given gesture type.
     *
     * @param {!Node} node Node to add listener on
     * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
     * @param {!function(!Event):void} handler Event listener function to call
     * @return {boolean} Returns true if a gesture event listener was added.
     */
    function addListener(node, evType, handler) {
      if (gestures[evType]) {
        _add(node, evType, handler);
        return true;
      }
      return false;
    }

    /**
     * Removes an event listener from a node for the given gesture type.
     *
     * @param {!Node} node Node to remove listener from
     * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
     * @param {!function(!Event):void} handler Event listener function previously passed to
     *  `addListener`.
     * @return {boolean} Returns true if a gesture event listener was removed.
     */
    function removeListener(node, evType, handler) {
      if (gestures[evType]) {
        _remove(node, evType, handler);
        return true;
      }
      return false;
    }

    /**
     * automate the event listeners for the native events
     *
     * @private
     * @param {!Node} node Node on which to add the event.
     * @param {string} evType Event type to add.
     * @param {function(!Event)} handler Event handler function.
     * @return {void}
     */
    function _add(node, evType, handler) {
      let recognizer = gestures[evType];
      let deps = recognizer.deps;
      let name = recognizer.name;
      let gobj = node[GESTURE_KEY];
      if (!gobj) {
        node[GESTURE_KEY] = gobj = {};
      }
      for (let i = 0, dep, gd; i < deps.length; i++) {
        dep = deps[i];
        // don't add mouse handlers on iOS because they cause gray selection overlays
        if (IS_TOUCH_ONLY && isMouseEvent(dep) && dep !== 'click') {
          continue;
        }
        gd = gobj[dep];
        if (!gd) {
          gobj[dep] = gd = {_count: 0};
        }
        if (gd._count === 0) {
          node.addEventListener(dep, _handleNative, PASSIVE_TOUCH(dep));
        }
        gd[name] = (gd[name] || 0) + 1;
        gd._count = (gd._count || 0) + 1;
      }
      node.addEventListener(evType, handler);
      if (recognizer.touchAction) {
        setTouchAction(node, recognizer.touchAction);
      }
    }

    /**
     * automate event listener removal for native events
     *
     * @private
     * @param {!Node} node Node on which to remove the event.
     * @param {string} evType Event type to remove.
     * @param {function(!Event): void} handler Event handler function.
     * @return {void}
     */
    function _remove(node, evType, handler) {
      let recognizer = gestures[evType];
      let deps = recognizer.deps;
      let name = recognizer.name;
      let gobj = node[GESTURE_KEY];
      if (gobj) {
        for (let i = 0, dep, gd; i < deps.length; i++) {
          dep = deps[i];
          gd = gobj[dep];
          if (gd && gd[name]) {
            gd[name] = (gd[name] || 1) - 1;
            gd._count = (gd._count || 1) - 1;
            if (gd._count === 0) {
              node.removeEventListener(dep, _handleNative, PASSIVE_TOUCH(dep));
            }
          }
        }
      }
      node.removeEventListener(evType, handler);
    }

    /**
     * Registers a new gesture event recognizer for adding new custom
     * gesture event types.
     *
     * @param {!GestureRecognizer} recog Gesture recognizer descriptor
     * @return {void}
     */
    function register$1(recog) {
      recognizers.push(recog);
      for (let i = 0; i < recog.emits.length; i++) {
        gestures[recog.emits[i]] = recog;
      }
    }

    /**
     * @private
     * @param {string} evName Event name.
     * @return {Object} Returns the gesture for the given event name.
     */
    function _findRecognizerByEvent(evName) {
      for (let i = 0, r; i < recognizers.length; i++) {
        r = recognizers[i];
        for (let j = 0, n; j < r.emits.length; j++) {
          n = r.emits[j];
          if (n === evName) {
            return r;
          }
        }
      }
      return null;
    }

    /**
     * Sets scrolling direction on node.
     *
     * This value is checked on first move, thus it should be called prior to
     * adding event listeners.
     *
     * @param {!Node} node Node to set touch action setting on
     * @param {string} value Touch action value
     * @return {void}
     */
    function setTouchAction(node, value) {
      if (HAS_NATIVE_TA) {
        // NOTE: add touchAction async so that events can be added in
        // custom element constructors. Otherwise we run afoul of custom
        // elements restriction against settings attributes (style) in the
        // constructor.
        microTask.run(() => {
          node.style.touchAction = value;
        });
      }
      node[TOUCH_ACTION] = value;
    }

    /**
     * Dispatches an event on the `target` element of `type` with the given
     * `detail`.
     * @private
     * @param {!EventTarget} target The element on which to fire an event.
     * @param {string} type The type of event to fire.
     * @param {!Object=} detail The detail object to populate on the event.
     * @return {void}
     */
    function _fire(target, type, detail) {
      let ev = new Event(type, { bubbles: true, cancelable: true, composed: true });
      ev.detail = detail;
      target.dispatchEvent(ev);
      // forward `preventDefault` in a clean way
      if (ev.defaultPrevented) {
        let preventer = detail.preventer || detail.sourceEvent;
        if (preventer && preventer.preventDefault) {
          preventer.preventDefault();
        }
      }
    }

    /**
     * Prevents the dispatch and default action of the given event name.
     *
     * @param {string} evName Event name.
     * @return {void}
     */
    function prevent(evName) {
      let recognizer = _findRecognizerByEvent(evName);
      if (recognizer.info) {
        recognizer.info.prevent = true;
      }
    }

    /**
     * Reset the 2500ms timeout on processing mouse input after detecting touch input.
     *
     * Touch inputs create synthesized mouse inputs anywhere from 0 to 2000ms after the touch.
     * This method should only be called during testing with simulated touch inputs.
     * Calling this method in production may cause duplicate taps or other Gestures.
     *
     * @return {void}
     */
    function resetMouseCanceller() {
      if (POINTERSTATE.mouse.mouseIgnoreJob) {
        POINTERSTATE.mouse.mouseIgnoreJob.flush();
      }
    }

    /* eslint-disable valid-jsdoc */

    register$1({
      name: 'downup',
      deps: ['mousedown', 'touchstart', 'touchend'],
      flow: {
        start: ['mousedown', 'touchstart'],
        end: ['mouseup', 'touchend']
      },
      emits: ['down', 'up'],

      info: {
        movefn: null,
        upfn: null
      },

      /**
       * @this {GestureRecognizer}
       * @return {void}
       */
      reset: function() {
        untrackDocument(this.info);
      },

      /**
       * @this {GestureRecognizer}
       * @param {MouseEvent} e
       * @return {void}
       */
      mousedown: function(e) {
        if (!hasLeftMouseButton(e)) {
          return;
        }
        let t = _findOriginalTarget(e);
        let self = this;
        let movefn = function movefn(e) {
          if (!hasLeftMouseButton(e)) {
            downupFire('up', t, e);
            untrackDocument(self.info);
          }
        };
        let upfn = function upfn(e) {
          if (hasLeftMouseButton(e)) {
            downupFire('up', t, e);
          }
          untrackDocument(self.info);
        };
        trackDocument(this.info, movefn, upfn);
        downupFire('down', t, e);
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchstart: function(e) {
        downupFire('down', _findOriginalTarget(e), e.changedTouches[0], e);
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchend: function(e) {
        downupFire('up', _findOriginalTarget(e), e.changedTouches[0], e);
      }
    });

    /**
     * @param {string} type
     * @param {EventTarget} target
     * @param {Event|Touch} event
     * @param {Event=} preventer
     * @return {void}
     */
    function downupFire(type, target, event, preventer) {
      if (!target) {
        return;
      }
      _fire(target, type, {
        x: event.clientX,
        y: event.clientY,
        sourceEvent: event,
        preventer: preventer,
        prevent: function(e) {
          return prevent(e);
        }
      });
    }

    register$1({
      name: 'track',
      touchAction: 'none',
      deps: ['mousedown', 'touchstart', 'touchmove', 'touchend'],
      flow: {
        start: ['mousedown', 'touchstart'],
        end: ['mouseup', 'touchend']
      },
      emits: ['track'],

      info: {
        x: 0,
        y: 0,
        state: 'start',
        started: false,
        moves: [],
        /** @this {GestureInfo} */
        addMove: function(move) {
          if (this.moves.length > TRACK_LENGTH) {
            this.moves.shift();
          }
          this.moves.push(move);
        },
        movefn: null,
        upfn: null,
        prevent: false
      },

      /**
       * @this {GestureRecognizer}
       * @return {void}
       */
      reset: function() {
        this.info.state = 'start';
        this.info.started = false;
        this.info.moves = [];
        this.info.x = 0;
        this.info.y = 0;
        this.info.prevent = false;
        untrackDocument(this.info);
      },

      /**
       * @this {GestureRecognizer}
       * @param {MouseEvent} e
       * @return {void}
       */
      mousedown: function(e) {
        if (!hasLeftMouseButton(e)) {
          return;
        }
        let t = _findOriginalTarget(e);
        let self = this;
        let movefn = function movefn(e) {
          let x = e.clientX, y = e.clientY;
          if (trackHasMovedEnough(self.info, x, y)) {
            // first move is 'start', subsequent moves are 'move', mouseup is 'end'
            self.info.state = self.info.started ? (e.type === 'mouseup' ? 'end' : 'track') : 'start';
            if (self.info.state === 'start') {
              // if and only if tracking, always prevent tap
              prevent('tap');
            }
            self.info.addMove({x: x, y: y});
            if (!hasLeftMouseButton(e)) {
              // always fire "end"
              self.info.state = 'end';
              untrackDocument(self.info);
            }
            if (t) {
              trackFire(self.info, t, e);
            }
            self.info.started = true;
          }
        };
        let upfn = function upfn(e) {
          if (self.info.started) {
            movefn(e);
          }

          // remove the temporary listeners
          untrackDocument(self.info);
        };
        // add temporary document listeners as mouse retargets
        trackDocument(this.info, movefn, upfn);
        this.info.x = e.clientX;
        this.info.y = e.clientY;
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchstart: function(e) {
        let ct = e.changedTouches[0];
        this.info.x = ct.clientX;
        this.info.y = ct.clientY;
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchmove: function(e) {
        let t = _findOriginalTarget(e);
        let ct = e.changedTouches[0];
        let x = ct.clientX, y = ct.clientY;
        if (trackHasMovedEnough(this.info, x, y)) {
          if (this.info.state === 'start') {
            // if and only if tracking, always prevent tap
            prevent('tap');
          }
          this.info.addMove({x: x, y: y});
          trackFire(this.info, t, ct);
          this.info.state = 'track';
          this.info.started = true;
        }
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchend: function(e) {
        let t = _findOriginalTarget(e);
        let ct = e.changedTouches[0];
        // only trackend if track was started and not aborted
        if (this.info.started) {
          // reset started state on up
          this.info.state = 'end';
          this.info.addMove({x: ct.clientX, y: ct.clientY});
          trackFire(this.info, t, ct);
        }
      }
    });

    /**
     * @param {!GestureInfo} info
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    function trackHasMovedEnough(info, x, y) {
      if (info.prevent) {
        return false;
      }
      if (info.started) {
        return true;
      }
      let dx = Math.abs(info.x - x);
      let dy = Math.abs(info.y - y);
      return (dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE);
    }

    /**
     * @param {!GestureInfo} info
     * @param {?EventTarget} target
     * @param {Touch} touch
     * @return {void}
     */
    function trackFire(info, target, touch) {
      if (!target) {
        return;
      }
      let secondlast = info.moves[info.moves.length - 2];
      let lastmove = info.moves[info.moves.length - 1];
      let dx = lastmove.x - info.x;
      let dy = lastmove.y - info.y;
      let ddx, ddy = 0;
      if (secondlast) {
        ddx = lastmove.x - secondlast.x;
        ddy = lastmove.y - secondlast.y;
      }
      _fire(target, 'track', {
        state: info.state,
        x: touch.clientX,
        y: touch.clientY,
        dx: dx,
        dy: dy,
        ddx: ddx,
        ddy: ddy,
        sourceEvent: touch,
        hover: function() {
          return deepTargetFind(touch.clientX, touch.clientY);
        }
      });
    }

    register$1({
      name: 'tap',
      deps: ['mousedown', 'click', 'touchstart', 'touchend'],
      flow: {
        start: ['mousedown', 'touchstart'],
        end: ['click', 'touchend']
      },
      emits: ['tap'],
      info: {
        x: NaN,
        y: NaN,
        prevent: false
      },
      /**
       * @this {GestureRecognizer}
       * @return {void}
       */
      reset: function() {
        this.info.x = NaN;
        this.info.y = NaN;
        this.info.prevent = false;
      },
      /**
       * @this {GestureRecognizer}
       * @param {MouseEvent} e
       * @return {void}
       */
      mousedown: function(e) {
        if (hasLeftMouseButton(e)) {
          this.info.x = e.clientX;
          this.info.y = e.clientY;
        }
      },
      /**
       * @this {GestureRecognizer}
       * @param {MouseEvent} e
       * @return {void}
       */
      click: function(e) {
        if (hasLeftMouseButton(e)) {
          trackForward(this.info, e);
        }
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchstart: function(e) {
        const touch = e.changedTouches[0];
        this.info.x = touch.clientX;
        this.info.y = touch.clientY;
      },
      /**
       * @this {GestureRecognizer}
       * @param {TouchEvent} e
       * @return {void}
       */
      touchend: function(e) {
        trackForward(this.info, e.changedTouches[0], e);
      }
    });

    /**
     * @param {!GestureInfo} info
     * @param {Event | Touch} e
     * @param {Event=} preventer
     * @return {void}
     */
    function trackForward(info, e, preventer) {
      let dx = Math.abs(e.clientX - info.x);
      let dy = Math.abs(e.clientY - info.y);
      // find original target from `preventer` for TouchEvents, or `e` for MouseEvents
      let t = _findOriginalTarget((preventer || e));
      if (!t || (canBeDisabled[/** @type {!HTMLElement} */(t).localName] && t.hasAttribute('disabled'))) {
        return;
      }
      // dx,dy can be NaN if `click` has been simulated and there was no `down` for `start`
      if (isNaN(dx) || isNaN(dy) || (dx <= TAP_DISTANCE && dy <= TAP_DISTANCE) || isSyntheticClick(e)) {
        // prevent taps from being generated if an event has canceled them
        if (!info.prevent) {
          _fire(t, 'tap', {
            x: e.clientX,
            y: e.clientY,
            sourceEvent: e,
            preventer: preventer
          });
        }
      }
    }

    /* eslint-enable valid-jsdoc */

    /** @deprecated */
    const findOriginalTarget = _findOriginalTarget;

    /** @deprecated */
    const add = addListener;

    /** @deprecated */
    const remove = removeListener;

    var gestures$0 = /*#__PURE__*/Object.freeze({
        gestures: gestures,
        recognizers: recognizers,
        deepTargetFind: deepTargetFind,
        addListener: addListener,
        removeListener: removeListener,
        register: register$1,
        setTouchAction: setTouchAction,
        prevent: prevent,
        resetMouseCanceller: resetMouseCanceller,
        findOriginalTarget: findOriginalTarget,
        add: add,
        remove: remove
    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const gestures$1 = gestures$0;

    /**
     * Element class mixin that provides API for adding Polymer's cross-platform
     * gesture events to nodes.
     *
     * The API is designed to be compatible with override points implemented
     * in `TemplateStamp` such that declarative event listeners in
     * templates will support gesture events when this mixin is applied along with
     * `TemplateStamp`.
     *
     * @mixinFunction
     * @polymer
     * @summary Element class mixin that provides API for adding Polymer's
     *   cross-platform
     * gesture events to nodes
     */
    const GestureEventListeners = dedupingMixin(
        /**
         * @template T
         * @param {function(new:T)} superClass Class to apply mixin to.
         * @return {function(new:T)} superClass with mixin applied.
         */
        (superClass) => {
          /**
           * @polymer
           * @mixinClass
           * @implements {Polymer_GestureEventListeners}
           */
          class GestureEventListeners extends superClass {
            /**
             * Add the event listener to the node if it is a gestures event.
             *
             * @param {!Node} node Node to add event listener to
             * @param {string} eventName Name of event
             * @param {function(!Event):void} handler Listener function to add
             * @return {void}
             * @override
             */
            _addEventListenerToNode(node, eventName, handler) {
              if (!gestures$1.addListener(node, eventName, handler)) {
                super._addEventListenerToNode(node, eventName, handler);
              }
            }

            /**
             * Remove the event listener to the node if it is a gestures event.
             *
             * @param {!Node} node Node to remove event listener from
             * @param {string} eventName Name of event
             * @param {function(!Event):void} handler Listener function to remove
             * @return {void}
             * @override
             */
            _removeEventListenerFromNode(node, eventName, handler) {
              if (!gestures$1.removeListener(node, eventName, handler)) {
                super._removeEventListenerFromNode(node, eventName, handler);
              }
            }
          }

          return GestureEventListeners;
        });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const HOST_DIR = /:host\(:dir\((ltr|rtl)\)\)/g;
    const HOST_DIR_REPLACMENT = ':host([dir="$1"])';

    const EL_DIR = /([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g;
    const EL_DIR_REPLACMENT = ':host([dir="$2"]) $1';

    /**
     * @type {!Array<!Polymer_DirMixin>}
     */
    const DIR_INSTANCES = [];

    /** @type {MutationObserver} */
    let observer = null;

    let DOCUMENT_DIR = '';

    function getRTL() {
      DOCUMENT_DIR = document.documentElement.getAttribute('dir');
    }

    /**
     * @param {!Polymer_DirMixin} instance Instance to set RTL status on
     */
    function setRTL(instance) {
      if (!instance.__autoDirOptOut) {
        const el = /** @type {!HTMLElement} */(instance);
        el.setAttribute('dir', DOCUMENT_DIR);
      }
    }

    function updateDirection() {
      getRTL();
      DOCUMENT_DIR = document.documentElement.getAttribute('dir');
      for (let i = 0; i < DIR_INSTANCES.length; i++) {
        setRTL(DIR_INSTANCES[i]);
      }
    }

    function takeRecords() {
      if (observer && observer.takeRecords().length) {
        updateDirection();
      }
    }

    /**
     * Element class mixin that allows elements to use the `:dir` CSS Selector to
     * have text direction specific styling.
     *
     * With this mixin, any stylesheet provided in the template will transform
     * `:dir` into `:host([dir])` and sync direction with the page via the
     * element's `dir` attribute.
     *
     * Elements can opt out of the global page text direction by setting the `dir`
     * attribute directly in `ready()` or in HTML.
     *
     * Caveats:
     * - Applications must set `<html dir="ltr">` or `<html dir="rtl">` to sync
     *   direction
     * - Automatic left-to-right or right-to-left styling is sync'd with the
     *   `<html>` element only.
     * - Changing `dir` at runtime is supported.
     * - Opting out of the global direction styling is permanent
     *
     * @mixinFunction
     * @polymer
     * @appliesMixin PropertyAccessors
     */
    const DirMixin = dedupingMixin((base) => {

      if (!observer) {
        getRTL();
        observer = new MutationObserver(updateDirection);
        observer.observe(document.documentElement, {attributes: true, attributeFilter: ['dir']});
      }

      /**
       * @constructor
       * @extends {base}
       * @implements {Polymer_PropertyAccessors}
       * @private
       */
      const elementBase = PropertyAccessors(base);

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_DirMixin}
       */
      class Dir extends elementBase {

        /**
         * @override
         * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
         */
        static _processStyleText(cssText, baseURI) {
          cssText = super._processStyleText(cssText, baseURI);
          cssText = this._replaceDirInCssText(cssText);
          return cssText;
        }

        /**
         * Replace `:dir` in the given CSS text
         *
         * @param {string} text CSS text to replace DIR
         * @return {string} Modified CSS
         */
        static _replaceDirInCssText(text) {
          let replacedText = text;
          replacedText = replacedText.replace(HOST_DIR, HOST_DIR_REPLACMENT);
          replacedText = replacedText.replace(EL_DIR, EL_DIR_REPLACMENT);
          if (text !== replacedText) {
            this.__activateDir = true;
          }
          return replacedText;
        }

        constructor() {
          super();
          /** @type {boolean} */
          this.__autoDirOptOut = false;
        }

        /**
         * @suppress {invalidCasts} Closure doesn't understand that `this` is an HTMLElement
         * @return {void}
         */
        ready() {
          super.ready();
          this.__autoDirOptOut = /** @type {!HTMLElement} */(this).hasAttribute('dir');
        }

        /**
         * @suppress {missingProperties} If it exists on elementBase, it can be super'd
         * @return {void}
         */
        connectedCallback() {
          if (elementBase.prototype.connectedCallback) {
            super.connectedCallback();
          }
          if (this.constructor.__activateDir) {
            takeRecords();
            DIR_INSTANCES.push(this);
            setRTL(this);
          }
        }

        /**
         * @suppress {missingProperties} If it exists on elementBase, it can be super'd
         * @return {void}
         */
        disconnectedCallback() {
          if (elementBase.prototype.disconnectedCallback) {
            super.disconnectedCallback();
          }
          if (this.constructor.__activateDir) {
            const idx = DIR_INSTANCES.indexOf(this);
            if (idx > -1) {
              DIR_INSTANCES.splice(idx, 1);
            }
          }
        }
      }

      Dir.__activateDir = false;

      return Dir;
    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    function resolve() {
      document.body.removeAttribute('unresolved');
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('DOMContentLoaded', resolve);
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    function newSplice(index, removed, addedCount) {
      return {
        index: index,
        removed: removed,
        addedCount: addedCount
      };
    }

    const EDIT_LEAVE = 0;
    const EDIT_UPDATE = 1;
    const EDIT_ADD = 2;
    const EDIT_DELETE = 3;

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    function calcEditDistances(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      let rowCount = oldEnd - oldStart + 1;
      let columnCount = currentEnd - currentStart + 1;
      let distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (let i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (let j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (let i = 1; i < rowCount; i++) {
        for (let j = 1; j < columnCount; j++) {
          if (equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            let north = distances[i - 1][j] + 1;
            let west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    }

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    function spliceOperationsFromEditDistances(distances) {
      let i = distances.length - 1;
      let j = distances[0].length - 1;
      let current = distances[i][j];
      let edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        let northWest = distances[i - 1][j - 1];
        let west = distances[i - 1][j];
        let north = distances[i][j - 1];

        let min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    }

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     *
     * @param {!Array} current The current "changed" array for which to
     * calculate splices.
     * @param {number} currentStart Starting index in the `current` array for
     * which splices are calculated.
     * @param {number} currentEnd Ending index in the `current` array for
     * which splices are calculated.
     * @param {!Array} old The original "unchanged" array to compare `current`
     * against to determine splices.
     * @param {number} oldStart Starting index in the `old` array for
     * which splices are calculated.
     * @param {number} oldEnd Ending index in the `old` array for
     * which splices are calculated.
     * @return {!Array} Returns an array of splice record objects. Each of these
     * contains: `index` the location where the splice occurred; `removed`
     * the array of removed items from this location; `addedCount` the number
     * of items added at this location.
     */
    function calcSplices(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      let prefixCount = 0;
      let suffixCount = 0;
      let splice;

      let minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      let ops = spliceOperationsFromEditDistances(
          calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      splice = undefined;
      let splices = [];
      let index = currentStart;
      let oldIndex = oldStart;
      for (let i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    }

    function sharedPrefix(current, old, searchLength) {
      for (let i = 0; i < searchLength; i++)
        if (!equals(current[i], old[i]))
          return i;
      return searchLength;
    }

    function sharedSuffix(current, old, searchLength) {
      let index1 = current.length;
      let index2 = old.length;
      let count = 0;
      while (count < searchLength && equals(current[--index1], old[--index2]))
        count++;

      return count;
    }

    /**
     * Returns an array of splice records indicating the minimum edits required
     * to transform the `previous` array into the `current` array.
     *
     * Splice records are ordered by index and contain the following fields:
     * - `index`: index where edit started
     * - `removed`: array of removed items from this index
     * - `addedCount`: number of items added at this index
     *
     * This function is based on the Levenshtein "minimum edit distance"
     * algorithm. Note that updates are treated as removal followed by addition.
     *
     * The worst-case time complexity of this algorithm is `O(l * p)`
     *   l: The length of the current array
     *   p: The length of the previous array
     *
     * However, the worst-case complexity is reduced by an `O(n)` optimization
     * to detect any shared prefix & suffix between the two arrays and only
     * perform the more expensive minimum edit distance calculation over the
     * non-shared portions of the arrays.
     *
     * @function
     * @param {!Array} current The "changed" array for which splices will be
     * calculated.
     * @param {!Array} previous The "unchanged" original array to compare
     * `current` against to determine the splices.
     * @return {!Array} Returns an array of splice record objects. Each of these
     * contains: `index` the location where the splice occurred; `removed`
     * the array of removed items from this location; `addedCount` the number
     * of items added at this location.
     */
    function calculateSplices(current, previous) {
      return calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    }

    function equals(currentValue, previousValue) {
      return currentValue === previousValue;
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Returns true if `node` is a slot element
     * @param {Node} node Node to test.
     * @return {boolean} Returns true if the given `node` is a slot
     * @private
     */
    function isSlot(node) {
      return (node.localName === 'slot');
    }

    /**
     * Class that listens for changes (additions or removals) to
     * "flattened nodes" on a given `node`. The list of flattened nodes consists
     * of a node's children and, for any children that are `<slot>` elements,
     * the expanded flattened list of `assignedNodes`.
     * For example, if the observed node has children `<a></a><slot></slot><b></b>`
     * and the `<slot>` has one `<div>` assigned to it, then the flattened
     * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
     * `<slot>` elements assigned to it, these are flattened as well.
     *
     * The provided `callback` is called whenever any change to this list
     * of flattened nodes occurs, where an addition or removal of a node is
     * considered a change. The `callback` is called with one argument, an object
     * containing an array of any `addedNodes` and `removedNodes`.
     *
     * Note: the callback is called asynchronous to any changes
     * at a microtask checkpoint. This is because observation is performed using
     * `MutationObserver` and the `<slot>` element's `slotchange` event which
     * are asynchronous.
     *
     * An example:
     * ```js
     * class TestSelfObserve extends PolymerElement {
     *   static get is() { return 'test-self-observe';}
     *   connectedCallback() {
     *     super.connectedCallback();
     *     this._observer = new FlattenedNodesObserver(this, (info) => {
     *       this.info = info;
     *     });
     *   }
     *   disconnectedCallback() {
     *     super.disconnectedCallback();
     *     this._observer.disconnect();
     *   }
     * }
     * customElements.define(TestSelfObserve.is, TestSelfObserve);
     * ```
     *
     * @summary Class that listens for changes (additions or removals) to
     * "flattened nodes" on a given `node`.
     */
    class FlattenedNodesObserver {

      /**
       * Returns the list of flattened nodes for the given `node`.
       * This list consists of a node's children and, for any children
       * that are `<slot>` elements, the expanded flattened list of `assignedNodes`.
       * For example, if the observed node has children `<a></a><slot></slot><b></b>`
       * and the `<slot>` has one `<div>` assigned to it, then the flattened
       * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
       * `<slot>` elements assigned to it, these are flattened as well.
       *
       * @param {HTMLElement|HTMLSlotElement} node The node for which to return the list of flattened nodes.
       * @return {Array} The list of flattened nodes for the given `node`.
      */
      static getFlattenedNodes(node) {
        if (isSlot(node)) {
          node = /** @type {HTMLSlotElement} */(node); // eslint-disable-line no-self-assign
          return node.assignedNodes({flatten: true});
        } else {
          return Array.from(node.childNodes).map((node) => {
            if (isSlot(node)) {
              node = /** @type {HTMLSlotElement} */(node); // eslint-disable-line no-self-assign
              return node.assignedNodes({flatten: true});
            } else {
              return [node];
            }
          }).reduce((a, b) => a.concat(b), []);
        }
      }

      /**
       * @param {Element} target Node on which to listen for changes.
       * @param {?function(!Element, { target: !Element, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Function called when there are additions
       * or removals from the target's list of flattened nodes.
      */
      constructor(target, callback) {
        /**
         * @type {MutationObserver}
         * @private
         */
        this._shadyChildrenObserver = null;
        /**
         * @type {MutationObserver}
         * @private
         */
        this._nativeChildrenObserver = null;
        this._connected = false;
        /**
         * @type {Element}
         * @private
         */
        this._target = target;
        this.callback = callback;
        this._effectiveNodes = [];
        this._observer = null;
        this._scheduled = false;
        /**
         * @type {function()}
         * @private
         */
        this._boundSchedule = () => {
          this._schedule();
        };
        this.connect();
        this._schedule();
      }

      /**
       * Activates an observer. This method is automatically called when
       * a `FlattenedNodesObserver` is created. It should only be called to
       * re-activate an observer that has been deactivated via the `disconnect` method.
       *
       * @return {void}
       */
      connect() {
        if (isSlot(this._target)) {
          this._listenSlots([this._target]);
        } else if (this._target.children) {
          this._listenSlots(this._target.children);
          if (window.ShadyDOM) {
            this._shadyChildrenObserver =
              ShadyDOM.observeChildren(this._target, (mutations) => {
                this._processMutations(mutations);
              });
          } else {
            this._nativeChildrenObserver =
              new MutationObserver((mutations) => {
                this._processMutations(mutations);
              });
            this._nativeChildrenObserver.observe(this._target, {childList: true});
          }
        }
        this._connected = true;
      }

      /**
       * Deactivates the flattened nodes observer. After calling this method
       * the observer callback will not be called when changes to flattened nodes
       * occur. The `connect` method may be subsequently called to reactivate
       * the observer.
       *
       * @return {void}
       */
      disconnect() {
        if (isSlot(this._target)) {
          this._unlistenSlots([this._target]);
        } else if (this._target.children) {
          this._unlistenSlots(this._target.children);
          if (window.ShadyDOM && this._shadyChildrenObserver) {
            ShadyDOM.unobserveChildren(this._shadyChildrenObserver);
            this._shadyChildrenObserver = null;
          } else if (this._nativeChildrenObserver) {
            this._nativeChildrenObserver.disconnect();
            this._nativeChildrenObserver = null;
          }
        }
        this._connected = false;
      }

      /**
       * @return {void}
       * @private
       */
      _schedule() {
        if (!this._scheduled) {
          this._scheduled = true;
          microTask.run(() => this.flush());
        }
      }

      /**
       * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
       * @return {void}
       * @private
       */
      _processMutations(mutations) {
        this._processSlotMutations(mutations);
        this.flush();
      }

      /**
       * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
       * @return {void}
       * @private
       */
      _processSlotMutations(mutations) {
        if (mutations) {
          for (let i=0; i < mutations.length; i++) {
            let mutation = mutations[i];
            if (mutation.addedNodes) {
              this._listenSlots(mutation.addedNodes);
            }
            if (mutation.removedNodes) {
              this._unlistenSlots(mutation.removedNodes);
            }
          }
        }
      }

      /**
       * Flushes the observer causing any pending changes to be immediately
       * delivered the observer callback. By default these changes are delivered
       * asynchronously at the next microtask checkpoint.
       *
       * @return {boolean} Returns true if any pending changes caused the observer
       * callback to run.
       */
      flush() {
        if (!this._connected) {
          return false;
        }
        if (window.ShadyDOM) {
          ShadyDOM.flush();
        }
        if (this._nativeChildrenObserver) {
          this._processSlotMutations(this._nativeChildrenObserver.takeRecords());
        } else if (this._shadyChildrenObserver) {
          this._processSlotMutations(this._shadyChildrenObserver.takeRecords());
        }
        this._scheduled = false;
        let info = {
          target: this._target,
          addedNodes: [],
          removedNodes: []
        };
        let newNodes = this.constructor.getFlattenedNodes(this._target);
        let splices = calculateSplices(newNodes,
          this._effectiveNodes);
        // process removals
        for (let i=0, s; (i<splices.length) && (s=splices[i]); i++) {
          for (let j=0, n; (j < s.removed.length) && (n=s.removed[j]); j++) {
            info.removedNodes.push(n);
          }
        }
        // process adds
        for (let i=0, s; (i<splices.length) && (s=splices[i]); i++) {
          for (let j=s.index; j < s.index + s.addedCount; j++) {
            info.addedNodes.push(newNodes[j]);
          }
        }
        // update cache
        this._effectiveNodes = newNodes;
        let didFlush = false;
        if (info.addedNodes.length || info.removedNodes.length) {
          didFlush = true;
          this.callback.call(this._target, info);
        }
        return didFlush;
      }

      /**
       * @param {!Array<Element|Node>|!NodeList<Node>} nodeList Nodes that could change
       * @return {void}
       * @private
       */
      _listenSlots(nodeList) {
        for (let i=0; i < nodeList.length; i++) {
          let n = nodeList[i];
          if (isSlot(n)) {
            n.addEventListener('slotchange', this._boundSchedule);
          }
        }
      }

      /**
       * @param {!Array<Element|Node>|!NodeList<Node>} nodeList Nodes that could change
       * @return {void}
       * @private
       */
      _unlistenSlots(nodeList) {
        for (let i=0; i < nodeList.length; i++) {
          let n = nodeList[i];
          if (isSlot(n)) {
            n.removeEventListener('slotchange', this._boundSchedule);
          }
        }
      }

    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let debouncerQueue = [];

    /**
     * Adds a `Debouncer` to a list of globally flushable tasks.
     *
     * @param {!Debouncer} debouncer Debouncer to enqueue
     * @return {void}
     */
    const enqueueDebouncer = function(debouncer) {
      debouncerQueue.push(debouncer);
    };

    function flushDebouncers() {
      const didFlush = Boolean(debouncerQueue.length);
      while (debouncerQueue.length) {
        try {
          debouncerQueue.shift().flush();
        } catch(e) {
          setTimeout(() => {
            throw e;
          });
        }
      }
      return didFlush;
    }

    /**
     * Forces several classes of asynchronously queued tasks to flush:
     * - Debouncers added via `enqueueDebouncer`
     * - ShadyDOM distribution
     *
     * @return {void}
     */
    const flush$1 = function() {
      let shadyDOM, debouncers;
      do {
        shadyDOM = window.ShadyDOM && ShadyDOM.flush();
        if (window.ShadyCSS && window.ShadyCSS.ScopingShim) {
          window.ShadyCSS.ScopingShim.flush();
        }
        debouncers = flushDebouncers();
      } while (shadyDOM || debouncers);
    };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    const p = Element.prototype;
    /**
     * @const {function(this:Node, string): boolean}
     */
    const normalizedMatchesSelector = p.matches || p.matchesSelector ||
      p.mozMatchesSelector || p.msMatchesSelector ||
      p.oMatchesSelector || p.webkitMatchesSelector;

    /**
     * Cross-platform `element.matches` shim.
     *
     * @function matchesSelector
     * @param {!Node} node Node to check selector against
     * @param {string} selector Selector to match
     * @return {boolean} True if node matched selector
     */
    const matchesSelector = function(node, selector) {
      return normalizedMatchesSelector.call(node, selector);
    };

    /**
     * Node API wrapper class returned from `Polymer.dom.(target)` when
     * `target` is a `Node`.
     *
     */
    class DomApi {

      /**
       * @param {Node} node Node for which to create a Polymer.dom helper object.
       */
      constructor(node) {
        this.node = node;
      }

      /**
       * Returns an instance of `Polymer.FlattenedNodesObserver` that
       * listens for node changes on this element.
       *
       * @param {function(!Element, { target: !Element, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Called when direct or distributed children
       *   of this element changes
       * @return {!FlattenedNodesObserver} Observer instance
       */
      observeNodes(callback) {
        return new FlattenedNodesObserver(this.node, callback);
      }

      /**
       * Disconnects an observer previously created via `observeNodes`
       *
       * @param {!FlattenedNodesObserver} observerHandle Observer instance
       *   to disconnect.
       * @return {void}
       */
      unobserveNodes(observerHandle) {
        observerHandle.disconnect();
      }

      /**
       * Provided as a backwards-compatible API only.  This method does nothing.
       * @return {void}
       */
      notifyObserver() {}

      /**
       * Returns true if the provided node is contained with this element's
       * light-DOM children or shadow root, including any nested shadow roots
       * of children therein.
       *
       * @param {Node} node Node to test
       * @return {boolean} Returns true if the given `node` is contained within
       *   this element's light or shadow DOM.
       */
      deepContains(node) {
        if (this.node.contains(node)) {
          return true;
        }
        let n = node;
        let doc = node.ownerDocument;
        // walk from node to `this` or `document`
        while (n && n !== doc && n !== this.node) {
          // use logical parentnode, or native ShadowRoot host
          n = n.parentNode || n.host;
        }
        return n === this.node;
      }

      /**
       * Returns the root node of this node.  Equivalent to `getRootNode()`.
       *
       * @return {Node} Top most element in the dom tree in which the node
       * exists. If the node is connected to a document this is either a
       * shadowRoot or the document; otherwise, it may be the node
       * itself or a node or document fragment containing it.
       */
      getOwnerRoot() {
        return this.node.getRootNode();
      }

      /**
       * For slot elements, returns the nodes assigned to the slot; otherwise
       * an empty array. It is equivalent to `<slot>.addignedNodes({flatten:true})`.
       *
       * @return {!Array<!Node>} Array of assigned nodes
       */
      getDistributedNodes() {
        return (this.node.localName === 'slot') ?
          this.node.assignedNodes({flatten: true}) :
          [];
      }

      /**
       * Returns an array of all slots this element was distributed to.
       *
       * @return {!Array<!HTMLSlotElement>} Description
       */
      getDestinationInsertionPoints() {
        let ip$ = [];
        let n = this.node.assignedSlot;
        while (n) {
          ip$.push(n);
          n = n.assignedSlot;
        }
        return ip$;
      }

      /**
       * Calls `importNode` on the `ownerDocument` for this node.
       *
       * @param {!Node} node Node to import
       * @param {boolean} deep True if the node should be cloned deeply during
       *   import
       * @return {Node} Clone of given node imported to this owner document
       */
      importNode(node, deep) {
        let doc = this.node instanceof Document ? this.node :
          this.node.ownerDocument;
        return doc.importNode(node, deep);
      }

      /**
       * @return {!Array<!Node>} Returns a flattened list of all child nodes and
       * nodes assigned to child slots.
       */
      getEffectiveChildNodes() {
        return FlattenedNodesObserver.getFlattenedNodes(this.node);
      }

      /**
       * Returns a filtered list of flattened child elements for this element based
       * on the given selector.
       *
       * @param {string} selector Selector to filter nodes against
       * @return {!Array<!HTMLElement>} List of flattened child elements
       */
      queryDistributedElements(selector) {
        let c$ = this.getEffectiveChildNodes();
        let list = [];
        for (let i=0, l=c$.length, c; (i<l) && (c=c$[i]); i++) {
          if ((c.nodeType === Node.ELEMENT_NODE) &&
              matchesSelector(c, selector)) {
            list.push(c);
          }
        }
        return list;
      }

      /**
       * For shadow roots, returns the currently focused element within this
       * shadow root.
       *
       * @return {Node|undefined} Currently focused element
       */
      get activeElement() {
        let node = this.node;
        return node._activeElement !== undefined ? node._activeElement : node.activeElement;
      }
    }

    function forwardMethods(proto, methods) {
      for (let i=0; i < methods.length; i++) {
        let method = methods[i];
        /* eslint-disable valid-jsdoc */
        proto[method] = /** @this {DomApi} */ function() {
          return this.node[method].apply(this.node, arguments);
        };
        /* eslint-enable */
      }
    }

    function forwardReadOnlyProperties(proto, properties) {
      for (let i=0; i < properties.length; i++) {
        let name = properties[i];
        Object.defineProperty(proto, name, {
          get: function() {
            const domApi = /** @type {DomApi} */(this);
            return domApi.node[name];
          },
          configurable: true
        });
      }
    }

    function forwardProperties(proto, properties) {
      for (let i=0; i < properties.length; i++) {
        let name = properties[i];
        Object.defineProperty(proto, name, {
          get: function() {
            const domApi = /** @type {DomApi} */(this);
            return domApi.node[name];
          },
          set: function(value) {
            /** @type {DomApi} */ (this).node[name] = value;
          },
          configurable: true
        });
      }
    }


    /**
     * Event API wrapper class returned from `Polymer.dom.(target)` when
     * `target` is an `Event`.
     */
    class EventApi {
      constructor(event) {
        this.event = event;
      }

      /**
       * Returns the first node on the `composedPath` of this event.
       *
       * @return {!EventTarget} The node this event was dispatched to
       */
      get rootTarget() {
        return this.event.composedPath()[0];
      }

      /**
       * Returns the local (re-targeted) target for this event.
       *
       * @return {!EventTarget} The local (re-targeted) target for this event.
       */
      get localTarget() {
        return this.event.target;
      }

      /**
       * Returns the `composedPath` for this event.
       * @return {!Array<!EventTarget>} The nodes this event propagated through
       */
      get path() {
        return this.event.composedPath();
      }
    }

    /**
     * @function
     * @param {boolean=} deep
     * @return {!Node}
     */
    DomApi.prototype.cloneNode;
    /**
     * @function
     * @param {!Node} node
     * @return {!Node}
     */
    DomApi.prototype.appendChild;
    /**
     * @function
     * @param {!Node} newChild
     * @param {Node} refChild
     * @return {!Node}
     */
    DomApi.prototype.insertBefore;
    /**
     * @function
     * @param {!Node} node
     * @return {!Node}
     */
    DomApi.prototype.removeChild;
    /**
     * @function
     * @param {!Node} oldChild
     * @param {!Node} newChild
     * @return {!Node}
     */
    DomApi.prototype.replaceChild;
    /**
     * @function
     * @param {string} name
     * @param {string} value
     * @return {void}
     */
    DomApi.prototype.setAttribute;
    /**
     * @function
     * @param {string} name
     * @return {void}
     */
    DomApi.prototype.removeAttribute;
    /**
     * @function
     * @param {string} selector
     * @return {?Element}
     */
    DomApi.prototype.querySelector;
    /**
     * @function
     * @param {string} selector
     * @return {!NodeList<!Element>}
     */
    DomApi.prototype.querySelectorAll;

    /** @type {?Node} */
    DomApi.prototype.parentNode;
    /** @type {?Node} */
    DomApi.prototype.firstChild;
    /** @type {?Node} */
    DomApi.prototype.lastChild;
    /** @type {?Node} */
    DomApi.prototype.nextSibling;
    /** @type {?Node} */
    DomApi.prototype.previousSibling;
    /** @type {?HTMLElement} */
    DomApi.prototype.firstElementChild;
    /** @type {?HTMLElement} */
    DomApi.prototype.lastElementChild;
    /** @type {?HTMLElement} */
    DomApi.prototype.nextElementSibling;
    /** @type {?HTMLElement} */
    DomApi.prototype.previousElementSibling;
    /** @type {!Array<!Node>} */
    DomApi.prototype.childNodes;
    /** @type {!Array<!HTMLElement>} */
    DomApi.prototype.children;
    /** @type {?DOMTokenList} */
    DomApi.prototype.classList;

    /** @type {string} */
    DomApi.prototype.textContent;
    /** @type {string} */
    DomApi.prototype.innerHTML;

    forwardMethods(DomApi.prototype, [
      'cloneNode', 'appendChild', 'insertBefore', 'removeChild',
      'replaceChild', 'setAttribute', 'removeAttribute',
      'querySelector', 'querySelectorAll'
    ]);

    forwardReadOnlyProperties(DomApi.prototype, [
      'parentNode', 'firstChild', 'lastChild',
      'nextSibling', 'previousSibling', 'firstElementChild',
      'lastElementChild', 'nextElementSibling', 'previousElementSibling',
      'childNodes', 'children', 'classList'
    ]);

    forwardProperties(DomApi.prototype, [
      'textContent', 'innerHTML'
    ]);

    /**
     * Legacy DOM and Event manipulation API wrapper factory used to abstract
     * differences between native Shadow DOM and "Shady DOM" when polyfilling on
     * older browsers.
     *
     * Note that in Polymer 2.x use of `Polymer.dom` is no longer required and
     * in the majority of cases simply facades directly to the standard native
     * API.
     *
     * @summary Legacy DOM and Event manipulation API wrapper factory used to
     * abstract differences between native Shadow DOM and "Shady DOM."
     * @param {(Node|Event)=} obj Node or event to operate on
     * @return {!DomApi|!EventApi} Wrapper providing either node API or event API
     */
    const dom = function(obj) {
      obj = obj || document;
      if (!obj.__domApi) {
        let helper;
        if (obj instanceof Event) {
          helper = new EventApi(obj);
        } else {
          helper = new DomApi(obj);
        }
        obj.__domApi = helper;
      }
      return obj.__domApi;
    };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let styleInterface = window.ShadyCSS;

    /**
     * Element class mixin that provides Polymer's "legacy" API intended to be
     * backward-compatible to the greatest extent possible with the API
     * found on the Polymer 1.x `Polymer.Base` prototype applied to all elements
     * defined using the `Polymer({...})` function.
     *
     * @mixinFunction
     * @polymer
     * @appliesMixin ElementMixin
     * @appliesMixin GestureEventListeners
     * @property isAttached {boolean} Set to `true` in this element's
     *   `connectedCallback` and `false` in `disconnectedCallback`
     * @summary Element class mixin that provides Polymer's "legacy" API
     */
    const LegacyElementMixin = dedupingMixin((base) => {

      /**
       * @constructor
       * @extends {base}
       * @implements {Polymer_ElementMixin}
       * @implements {Polymer_GestureEventListeners}
       * @implements {Polymer_DirMixin}
       * @private
       */
      const legacyElementBase = DirMixin(GestureEventListeners(ElementMixin(base)));

      /**
       * Map of simple names to touch action names
       * @dict
       */
      const DIRECTION_MAP = {
        'x': 'pan-x',
        'y': 'pan-y',
        'none': 'none',
        'all': 'auto'
      };

      /**
       * @polymer
       * @mixinClass
       * @extends {legacyElementBase}
       * @implements {Polymer_LegacyElementMixin}
       * @unrestricted
       */
      class LegacyElement extends legacyElementBase {

        constructor() {
          super();
          /** @type {boolean} */
          this.isAttached;
          /** @type {WeakMap<!Element, !Object<string, !Function>>} */
          this.__boundListeners;
          /** @type {Object<string, Function>} */
          this._debouncers;
          // Ensure listeners are applied immediately so that they are
          // added before declarative event listeners. This allows an element to
          // decorate itself via an event prior to any declarative listeners
          // seeing the event. Note, this ensures compatibility with 1.x ordering.
          this._applyListeners();
        }

        /**
         * Forwards `importMeta` from the prototype (i.e. from the info object
         * passed to `Polymer({...})`) to the static API.
         *
         * @return {!Object} The `import.meta` object set on the prototype
         * @suppress {missingProperties} `this` is always in the instance in
         *  closure for some reason even in a static method, rather than the class
         */
        static get importMeta() {
          return this.prototype.importMeta;
        }

        /**
         * Legacy callback called during the `constructor`, for overriding
         * by the user.
         * @return {void}
         */
        created() {}

        /**
         * Provides an implementation of `connectedCallback`
         * which adds Polymer legacy API's `attached` method.
         * @return {void}
         * @override
         */
        connectedCallback() {
          super.connectedCallback();
          this.isAttached = true;
          this.attached();
        }

        /**
         * Legacy callback called during `connectedCallback`, for overriding
         * by the user.
         * @return {void}
         */
        attached() {}

        /**
         * Provides an implementation of `disconnectedCallback`
         * which adds Polymer legacy API's `detached` method.
         * @return {void}
         * @override
         */
        disconnectedCallback() {
          super.disconnectedCallback();
          this.isAttached = false;
          this.detached();
        }

        /**
         * Legacy callback called during `disconnectedCallback`, for overriding
         * by the user.
         * @return {void}
         */
        detached() {}

        /**
         * Provides an override implementation of `attributeChangedCallback`
         * which adds the Polymer legacy API's `attributeChanged` method.
         * @param {string} name Name of attribute.
         * @param {?string} old Old value of attribute.
         * @param {?string} value Current value of attribute.
         * @param {?string} namespace Attribute namespace.
         * @return {void}
         * @override
         */
        attributeChangedCallback(name, old, value, namespace) {
          if (old !== value) {
            super.attributeChangedCallback(name, old, value, namespace);
            this.attributeChanged(name, old, value);
          }
        }

        /**
         * Legacy callback called during `attributeChangedChallback`, for overriding
         * by the user.
         * @param {string} name Name of attribute.
         * @param {?string} old Old value of attribute.
         * @param {?string} value Current value of attribute.
         * @return {void}
         */
        attributeChanged(name, old, value) {} // eslint-disable-line no-unused-vars

        /**
         * Overrides the default `Polymer.PropertyEffects` implementation to
         * add support for class initialization via the `_registered` callback.
         * This is called only when the first instance of the element is created.
         *
         * @return {void}
         * @override
         * @suppress {invalidCasts}
         */
        _initializeProperties() {
          let proto = Object.getPrototypeOf(this);
          if (!proto.hasOwnProperty('__hasRegisterFinished')) {
            proto.__hasRegisterFinished = true;
            this._registered();
          }
          super._initializeProperties();
          this.root = /** @type {HTMLElement} */(this);
          this.created();
        }

        /**
         * Called automatically when an element is initializing.
         * Users may override this method to perform class registration time
         * work. The implementation should ensure the work is performed
         * only once for the class.
         * @protected
         * @return {void}
         */
        _registered() {}

        /**
         * Overrides the default `Polymer.PropertyEffects` implementation to
         * add support for installing `hostAttributes` and `listeners`.
         *
         * @return {void}
         * @override
         */
        ready() {
          this._ensureAttributes();
          super.ready();
        }

        /**
         * Ensures an element has required attributes. Called when the element
         * is being readied via `ready`. Users should override to set the
         * element's required attributes. The implementation should be sure
         * to check and not override existing attributes added by
         * the user of the element. Typically, setting attributes should be left
         * to the element user and not done here; reasonable exceptions include
         * setting aria roles and focusability.
         * @protected
         * @return {void}
         */
        _ensureAttributes() {}

        /**
         * Adds element event listeners. Called when the element
         * is being readied via `ready`. Users should override to
         * add any required element event listeners.
         * In performance critical elements, the work done here should be kept
         * to a minimum since it is done before the element is rendered. In
         * these elements, consider adding listeners asynchronously so as not to
         * block render.
         * @protected
         * @return {void}
         */
        _applyListeners() {}

        /**
         * Converts a typed JavaScript value to a string.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features. To customize
         * how properties are serialized to attributes for attribute bindings and
         * `reflectToAttribute: true` properties as well as this method, override
         * the `_serializeValue` method provided by `Polymer.PropertyAccessors`.
         *
         * @param {*} value Value to deserialize
         * @return {string | undefined} Serialized value
         */
        serialize(value) {
          return this._serializeValue(value);
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.  To customize
         * how attributes are deserialized to properties for in
         * `attributeChangedCallback`, override `_deserializeValue` method
         * provided by `Polymer.PropertyAccessors`.
         *
         * @param {string} value String to deserialize
         * @param {*} type Type to deserialize the string to
         * @return {*} Returns the deserialized value in the `type` given.
         */
        deserialize(value, type) {
          return this._deserializeValue(value, type);
        }

        /**
         * Serializes a property to its associated attribute.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         *
         * @param {string} property Property name to reflect.
         * @param {string=} attribute Attribute name to reflect.
         * @param {*=} value Property value to reflect.
         * @return {void}
         */
        reflectPropertyToAttribute(property, attribute, value) {
          this._propertyToAttribute(property, attribute, value);
        }

        /**
         * Sets a typed value to an HTML attribute on a node.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         *
         * @param {*} value Value to serialize.
         * @param {string} attribute Attribute name to serialize to.
         * @param {Element} node Element to set attribute to.
         * @return {void}
         */
        serializeValueToAttribute(value, attribute, node) {
          this._valueToNodeAttribute(/** @type {Element} */ (node || this), value, attribute);
        }

        /**
         * Copies own properties (including accessor descriptors) from a source
         * object to a target object.
         *
         * @param {Object} prototype Target object to copy properties to.
         * @param {Object} api Source object to copy properties from.
         * @return {Object} prototype object that was passed as first argument.
         */
        extend(prototype, api) {
          if (!(prototype && api)) {
            return prototype || api;
          }
          let n$ = Object.getOwnPropertyNames(api);
          for (let i=0, n; (i<n$.length) && (n=n$[i]); i++) {
            let pd = Object.getOwnPropertyDescriptor(api, n);
            if (pd) {
              Object.defineProperty(prototype, n, pd);
            }
          }
          return prototype;
        }

        /**
         * Copies props from a source object to a target object.
         *
         * Note, this method uses a simple `for...in` strategy for enumerating
         * properties.  To ensure only `ownProperties` are copied from source
         * to target and that accessor implementations are copied, use `extend`.
         *
         * @param {!Object} target Target object to copy properties to.
         * @param {!Object} source Source object to copy properties from.
         * @return {!Object} Target object that was passed as first argument.
         */
        mixin(target, source) {
          for (let i in source) {
            target[i] = source[i];
          }
          return target;
        }

        /**
         * Sets the prototype of an object.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         * @param {Object} object The object on which to set the prototype.
         * @param {Object} prototype The prototype that will be set on the given
         * `object`.
         * @return {Object} Returns the given `object` with its prototype set
         * to the given `prototype` object.
         */
        chainObject(object, prototype) {
          if (object && prototype && object !== prototype) {
            object.__proto__ = prototype;
          }
          return object;
        }

        /* **** Begin Template **** */

        /**
         * Calls `importNode` on the `content` of the `template` specified and
         * returns a document fragment containing the imported content.
         *
         * @param {HTMLTemplateElement} template HTML template element to instance.
         * @return {!DocumentFragment} Document fragment containing the imported
         *   template content.
        */
        instanceTemplate(template) {
          let content = this.constructor._contentForTemplate(template);
          let dom$$1 = /** @type {!DocumentFragment} */
            (document.importNode(content, true));
          return dom$$1;
        }

        /* **** Begin Events **** */



        /**
         * Dispatches a custom event with an optional detail value.
         *
         * @param {string} type Name of event type.
         * @param {*=} detail Detail value containing event-specific
         *   payload.
         * @param {{ bubbles: (boolean|undefined), cancelable: (boolean|undefined), composed: (boolean|undefined) }=}
         *  options Object specifying options.  These may include:
         *  `bubbles` (boolean, defaults to `true`),
         *  `cancelable` (boolean, defaults to false), and
         *  `node` on which to fire the event (HTMLElement, defaults to `this`).
         * @return {!Event} The new event that was fired.
         */
        fire(type, detail, options) {
          options = options || {};
          detail = (detail === null || detail === undefined) ? {} : detail;
          let event = new Event(type, {
            bubbles: options.bubbles === undefined ? true : options.bubbles,
            cancelable: Boolean(options.cancelable),
            composed: options.composed === undefined ? true: options.composed
          });
          event.detail = detail;
          let node = options.node || this;
          node.dispatchEvent(event);
          return event;
        }

        /**
         * Convenience method to add an event listener on a given element,
         * late bound to a named method on this element.
         *
         * @param {Element} node Element to add event listener to.
         * @param {string} eventName Name of event to listen for.
         * @param {string} methodName Name of handler method on `this` to call.
         * @return {void}
         */
        listen(node, eventName, methodName) {
          node = /** @type {!Element} */ (node || this);
          let hbl = this.__boundListeners ||
            (this.__boundListeners = new WeakMap());
          let bl = hbl.get(node);
          if (!bl) {
            bl = {};
            hbl.set(node, bl);
          }
          let key = eventName + methodName;
          if (!bl[key]) {
            bl[key] = this._addMethodEventListenerToNode(
              node, eventName, methodName, this);
          }
        }

        /**
         * Convenience method to remove an event listener from a given element,
         * late bound to a named method on this element.
         *
         * @param {Element} node Element to remove event listener from.
         * @param {string} eventName Name of event to stop listening to.
         * @param {string} methodName Name of handler method on `this` to not call
         anymore.
         * @return {void}
         */
        unlisten(node, eventName, methodName) {
          node = /** @type {!Element} */ (node || this);
          let bl = this.__boundListeners && this.__boundListeners.get(node);
          let key = eventName + methodName;
          let handler = bl && bl[key];
          if (handler) {
            this._removeEventListenerFromNode(node, eventName, handler);
            bl[key] = null;
          }
        }

        /**
         * Override scrolling behavior to all direction, one direction, or none.
         *
         * Valid scroll directions:
         *   - 'all': scroll in any direction
         *   - 'x': scroll only in the 'x' direction
         *   - 'y': scroll only in the 'y' direction
         *   - 'none': disable scrolling for this node
         *
         * @param {string=} direction Direction to allow scrolling
         * Defaults to `all`.
         * @param {Element=} node Element to apply scroll direction setting.
         * Defaults to `this`.
         * @return {void}
         */
        setScrollDirection(direction, node) {
          setTouchAction(/** @type {Element} */ (node || this), DIRECTION_MAP[direction] || 'auto');
        }
        /* **** End Events **** */

        /**
         * Convenience method to run `querySelector` on this local DOM scope.
         *
         * This function calls `Polymer.dom(this.root).querySelector(slctr)`.
         *
         * @param {string} slctr Selector to run on this local DOM scope
         * @return {Element} Element found by the selector, or null if not found.
         */
        $$(slctr) {
          return this.root.querySelector(slctr);
        }

        /**
         * Return the element whose local dom within which this element
         * is contained. This is a shorthand for
         * `this.getRootNode().host`.
         * @this {Element}
         */
        get domHost() {
          let root$$1 = this.getRootNode();
          return (root$$1 instanceof DocumentFragment) ? /** @type {ShadowRoot} */ (root$$1).host : root$$1;
        }

        /**
         * Force this element to distribute its children to its local dom.
         * This should not be necessary as of Polymer 2.0.2 and is provided only
         * for backwards compatibility.
         * @return {void}
         */
        distributeContent() {
          if (window.ShadyDOM && this.shadowRoot) {
            ShadyDOM.flush();
          }
        }

        /**
         * Returns a list of nodes that are the effective childNodes. The effective
         * childNodes list is the same as the element's childNodes except that
         * any `<content>` elements are replaced with the list of nodes distributed
         * to the `<content>`, the result of its `getDistributedNodes` method.
         * @return {!Array<!Node>} List of effective child nodes.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */
        getEffectiveChildNodes() {
          const thisEl = /** @type {Element} */ (this);
          const domApi = /** @type {DomApi} */(dom(thisEl));
          return domApi.getEffectiveChildNodes();
        }

        /**
         * Returns a list of nodes distributed within this element that match
         * `selector`. These can be dom children or elements distributed to
         * children that are insertion points.
         * @param {string} selector Selector to run.
         * @return {!Array<!Node>} List of distributed elements that match selector.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */
        queryDistributedElements(selector) {
          const thisEl = /** @type {Element} */ (this);
          const domApi = /** @type {DomApi} */(dom(thisEl));
          return domApi.queryDistributedElements(selector);
        }

        /**
         * Returns a list of elements that are the effective children. The effective
         * children list is the same as the element's children except that
         * any `<content>` elements are replaced with the list of elements
         * distributed to the `<content>`.
         *
         * @return {!Array<!Node>} List of effective children.
         */
        getEffectiveChildren() {
          let list = this.getEffectiveChildNodes();
          return list.filter(function(/** @type {!Node} */ n) {
            return (n.nodeType === Node.ELEMENT_NODE);
          });
        }

        /**
         * Returns a string of text content that is the concatenation of the
         * text content's of the element's effective childNodes (the elements
         * returned by <a href="#getEffectiveChildNodes>getEffectiveChildNodes</a>.
         *
         * @return {string} List of effective children.
         */
        getEffectiveTextContent() {
          let cn = this.getEffectiveChildNodes();
          let tc = [];
          for (let i=0, c; (c = cn[i]); i++) {
            if (c.nodeType !== Node.COMMENT_NODE) {
              tc.push(c.textContent);
            }
          }
          return tc.join('');
        }

        /**
         * Returns the first effective childNode within this element that
         * match `selector`. These can be dom child nodes or elements distributed
         * to children that are insertion points.
         * @param {string} selector Selector to run.
         * @return {Node} First effective child node that matches selector.
         */
        queryEffectiveChildren(selector) {
          let e$ = this.queryDistributedElements(selector);
          return e$ && e$[0];
        }

        /**
         * Returns a list of effective childNodes within this element that
         * match `selector`. These can be dom child nodes or elements distributed
         * to children that are insertion points.
         * @param {string} selector Selector to run.
         * @return {!Array<!Node>} List of effective child nodes that match selector.
         */
        queryAllEffectiveChildren(selector) {
          return this.queryDistributedElements(selector);
        }

        /**
         * Returns a list of nodes distributed to this element's `<slot>`.
         *
         * If this element contains more than one `<slot>` in its local DOM,
         * an optional selector may be passed to choose the desired content.
         *
         * @param {string=} slctr CSS selector to choose the desired
         *   `<slot>`.  Defaults to `content`.
         * @return {!Array<!Node>} List of distributed nodes for the `<slot>`.
         */
        getContentChildNodes(slctr) {
          let content = this.root.querySelector(slctr || 'slot');
          return content ? /** @type {DomApi} */(dom(content)).getDistributedNodes() : [];
        }

        /**
         * Returns a list of element children distributed to this element's
         * `<slot>`.
         *
         * If this element contains more than one `<slot>` in its
         * local DOM, an optional selector may be passed to choose the desired
         * content.  This method differs from `getContentChildNodes` in that only
         * elements are returned.
         *
         * @param {string=} slctr CSS selector to choose the desired
         *   `<content>`.  Defaults to `content`.
         * @return {!Array<!HTMLElement>} List of distributed nodes for the
         *   `<slot>`.
         * @suppress {invalidCasts}
         */
        getContentChildren(slctr) {
          let children = /** @type {!Array<!HTMLElement>} */(this.getContentChildNodes(slctr).filter(function(n) {
            return (n.nodeType === Node.ELEMENT_NODE);
          }));
          return children;
        }

        /**
         * Checks whether an element is in this element's light DOM tree.
         *
         * @param {?Node} node The element to be checked.
         * @return {boolean} true if node is in this element's light DOM tree.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */
        isLightDescendant(node) {
          const thisNode = /** @type {Node} */ (this);
          return thisNode !== node && thisNode.contains(node) &&
            thisNode.getRootNode() === node.getRootNode();
        }

        /**
         * Checks whether an element is in this element's local DOM tree.
         *
         * @param {!Element} node The element to be checked.
         * @return {boolean} true if node is in this element's local DOM tree.
         */
        isLocalDescendant(node) {
          return this.root === node.getRootNode();
        }

        /**
         * No-op for backwards compatibility. This should now be handled by
         * ShadyCss library.
         * @param  {*} container Unused
         * @param  {*} shouldObserve Unused
         * @return {void}
         */
        scopeSubtree(container, shouldObserve) { // eslint-disable-line no-unused-vars
        }

        /**
         * Returns the computed style value for the given property.
         * @param {string} property The css property name.
         * @return {string} Returns the computed css property value for the given
         * `property`.
         * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
         */
        getComputedStyleValue(property) {
          return styleInterface.getComputedStyleValue(/** @type {!Element} */(this), property);
        }

        // debounce

        /**
         * Call `debounce` to collapse multiple requests for a named task into
         * one invocation which is made after the wait time has elapsed with
         * no new request.  If no wait time is given, the callback will be called
         * at microtask timing (guaranteed before paint).
         *
         *     debouncedClickAction(e) {
         *       // will not call `processClick` more than once per 100ms
         *       this.debounce('click', function() {
         *        this.processClick();
         *       } 100);
         *     }
         *
         * @param {string} jobName String to identify the debounce job.
         * @param {function():void} callback Function that is called (with `this`
         *   context) when the wait time elapses.
         * @param {number} wait Optional wait time in milliseconds (ms) after the
         *   last signal that must elapse before invoking `callback`
         * @return {!Object} Returns a debouncer object on which exists the
         * following methods: `isActive()` returns true if the debouncer is
         * active; `cancel()` cancels the debouncer if it is active;
         * `flush()` immediately invokes the debounced callback if the debouncer
         * is active.
         */
        debounce(jobName, callback, wait) {
          this._debouncers = this._debouncers || {};
          return this._debouncers[jobName] = Debouncer.debounce(
                this._debouncers[jobName]
              , wait > 0 ? timeOut.after(wait) : microTask
              , callback.bind(this));
        }

        /**
         * Returns whether a named debouncer is active.
         *
         * @param {string} jobName The name of the debouncer started with `debounce`
         * @return {boolean} Whether the debouncer is active (has not yet fired).
         */
        isDebouncerActive(jobName) {
          this._debouncers = this._debouncers || {};
          let debouncer = this._debouncers[jobName];
          return !!(debouncer && debouncer.isActive());
        }

        /**
         * Immediately calls the debouncer `callback` and inactivates it.
         *
         * @param {string} jobName The name of the debouncer started with `debounce`
         * @return {void}
         */
        flushDebouncer(jobName) {
          this._debouncers = this._debouncers || {};
          let debouncer = this._debouncers[jobName];
          if (debouncer) {
            debouncer.flush();
          }
        }

        /**
         * Cancels an active debouncer.  The `callback` will not be called.
         *
         * @param {string} jobName The name of the debouncer started with `debounce`
         * @return {void}
         */
        cancelDebouncer(jobName) {
          this._debouncers = this._debouncers || {};
          let debouncer = this._debouncers[jobName];
          if (debouncer) {
            debouncer.cancel();
          }
        }

        /**
         * Runs a callback function asynchronously.
         *
         * By default (if no waitTime is specified), async callbacks are run at
         * microtask timing, which will occur before paint.
         *
         * @param {!Function} callback The callback function to run, bound to `this`.
         * @param {number=} waitTime Time to wait before calling the
         *   `callback`.  If unspecified or 0, the callback will be run at microtask
         *   timing (before paint).
         * @return {number} Handle that may be used to cancel the async job.
         */
        async(callback, waitTime) {
          return waitTime > 0 ? timeOut.run(callback.bind(this), waitTime) :
              ~microTask.run(callback.bind(this));
        }

        /**
         * Cancels an async operation started with `async`.
         *
         * @param {number} handle Handle returned from original `async` call to
         *   cancel.
         * @return {void}
         */
        cancelAsync(handle) {
          handle < 0 ? microTask.cancel(~handle) :
              timeOut.cancel(handle);
        }

        // other

        /**
         * Convenience method for creating an element and configuring it.
         *
         * @param {string} tag HTML element tag to create.
         * @param {Object=} props Object of properties to configure on the
         *    instance.
         * @return {!Element} Newly created and configured element.
         */
        create(tag, props) {
          let elt = document.createElement(tag);
          if (props) {
            if (elt.setProperties) {
              elt.setProperties(props);
            } else {
              for (let n in props) {
                elt[n] = props[n];
              }
            }
          }
          return elt;
        }

        /**
         * Polyfill for Element.prototype.matches, which is sometimes still
         * prefixed.
         *
         * @param {string} selector Selector to test.
         * @param {!Element=} node Element to test the selector against.
         * @return {boolean} Whether the element matches the selector.
         */
        elementMatches(selector, node) {
          return matchesSelector( (node || this), selector);
        }

        /**
         * Toggles an HTML attribute on or off.
         *
         * @param {string} name HTML attribute name
         * @param {boolean=} bool Boolean to force the attribute on or off.
         *    When unspecified, the state of the attribute will be reversed.
         * @param {Element=} node Node to target.  Defaults to `this`.
         * @return {void}
         */
        toggleAttribute(name, bool, node) {
          node = /** @type {Element} */ (node || this);
          if (arguments.length == 1) {
            bool = !node.hasAttribute(name);
          }
          if (bool) {
            node.setAttribute(name, '');
          } else {
            node.removeAttribute(name);
          }
        }


        /**
         * Toggles a CSS class on or off.
         *
         * @param {string} name CSS class name
         * @param {boolean=} bool Boolean to force the class on or off.
         *    When unspecified, the state of the class will be reversed.
         * @param {Element=} node Node to target.  Defaults to `this`.
         * @return {void}
         */
        toggleClass(name, bool, node) {
          node = /** @type {Element} */ (node || this);
          if (arguments.length == 1) {
            bool = !node.classList.contains(name);
          }
          if (bool) {
            node.classList.add(name);
          } else {
            node.classList.remove(name);
          }
        }

        /**
         * Cross-platform helper for setting an element's CSS `transform` property.
         *
         * @param {string} transformText Transform setting.
         * @param {Element=} node Element to apply the transform to.
         * Defaults to `this`
         * @return {void}
         */
        transform(transformText, node) {
          node = /** @type {Element} */ (node || this);
          node.style.webkitTransform = transformText;
          node.style.transform = transformText;
        }

        /**
         * Cross-platform helper for setting an element's CSS `translate3d`
         * property.
         *
         * @param {number} x X offset.
         * @param {number} y Y offset.
         * @param {number} z Z offset.
         * @param {Element=} node Element to apply the transform to.
         * Defaults to `this`.
         * @return {void}
         */
        translate3d(x, y, z, node) {
          node = /** @type {Element} */ (node || this);
          this.transform('translate3d(' + x + ',' + y + ',' + z + ')', node);
        }

        /**
         * Removes an item from an array, if it exists.
         *
         * If the array is specified by path, a change notification is
         * generated, so that observers, data bindings and computed
         * properties watching that path can update.
         *
         * If the array is passed directly, **no change
         * notification is generated**.
         *
         * @param {string | !Array<number|string>} arrayOrPath Path to array from which to remove the item
         *   (or the array itself).
         * @param {*} item Item to remove.
         * @return {Array} Array containing item removed.
         */
        arrayDelete(arrayOrPath, item) {
          let index;
          if (Array.isArray(arrayOrPath)) {
            index = arrayOrPath.indexOf(item);
            if (index >= 0) {
              return arrayOrPath.splice(index, 1);
            }
          } else {
            let arr = get(this, arrayOrPath);
            index = arr.indexOf(item);
            if (index >= 0) {
              return this.splice(arrayOrPath, index, 1);
            }
          }
          return null;
        }

        // logging

        /**
         * Facades `console.log`/`warn`/`error` as override point.
         *
         * @param {string} level One of 'log', 'warn', 'error'
         * @param {Array} args Array of strings or objects to log
         * @return {void}
         */
        _logger(level, args) {
          // accept ['foo', 'bar'] and [['foo', 'bar']]
          if (Array.isArray(args) && args.length === 1 && Array.isArray(args[0])) {
            args = args[0];
          }
          switch(level) {
            case 'log':
            case 'warn':
            case 'error':
              console[level](...args);
          }
        }

        /**
         * Facades `console.log` as an override point.
         *
         * @param {...*} args Array of strings or objects to log
         * @return {void}
         */
        _log(...args) {
          this._logger('log', args);
        }

        /**
         * Facades `console.warn` as an override point.
         *
         * @param {...*} args Array of strings or objects to log
         * @return {void}
         */
        _warn(...args) {
          this._logger('warn', args);
        }

        /**
         * Facades `console.error` as an override point.
         *
         * @param {...*} args Array of strings or objects to log
         * @return {void}
         */
        _error(...args) {
          this._logger('error', args);
        }

        /**
         * Formats a message using the element type an a method name.
         *
         * @param {string} methodName Method name to associate with message
         * @param {...*} args Array of strings or objects to log
         * @return {Array} Array with formatting information for `console`
         *   logging.
         */
        _logf(methodName, ...args) {
          return ['[%s::%s]', this.is, methodName, ...args];
        }

      }

      LegacyElement.prototype.is = '';

      return LegacyElement;

    });

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let metaProps = {
      attached: true,
      detached: true,
      ready: true,
      created: true,
      beforeRegister: true,
      registered: true,
      attributeChanged: true,
      // meta objects
      behaviors: true
    };

    /**
     * Applies a "legacy" behavior or array of behaviors to the provided class.
     *
     * Note: this method will automatically also apply the `LegacyElementMixin`
     * to ensure that any legacy behaviors can rely on legacy Polymer API on
     * the underlying element.
     *
     * @function
     * @template T
     * @param {!Object|!Array<!Object>} behaviors Behavior object or array of behaviors.
     * @param {function(new:T)} klass Element class.
     * @return {function(new:T)} Returns a new Element class extended by the
     * passed in `behaviors` and also by `LegacyElementMixin`.
     * @suppress {invalidCasts, checkTypes}
     */
    function mixinBehaviors(behaviors, klass) {
      if (!behaviors) {
        klass = /** @type {HTMLElement} */(klass); // eslint-disable-line no-self-assign
        return klass;
      }
      // NOTE: ensure the behavior is extending a class with
      // legacy element api. This is necessary since behaviors expect to be able
      // to access 1.x legacy api.
      klass = LegacyElementMixin(klass);
      if (!Array.isArray(behaviors)) {
        behaviors = [behaviors];
      }
      let superBehaviors = klass.prototype.behaviors;
      // get flattened, deduped list of behaviors *not* already on super class
      behaviors = flattenBehaviors(behaviors, null, superBehaviors);
      // mixin new behaviors
      klass = _mixinBehaviors(behaviors, klass);
      if (superBehaviors) {
        behaviors = superBehaviors.concat(behaviors);
      }
      // Set behaviors on prototype for BC...
      klass.prototype.behaviors = behaviors;
      return klass;
    }

    // NOTE:
    // 1.x
    // Behaviors were mixed in *in reverse order* and de-duped on the fly.
    // The rule was that behavior properties were copied onto the element
    // prototype if and only if the property did not already exist.
    // Given: Polymer{ behaviors: [A, B, C, A, B]}, property copy order was:
    // (1), B, (2), A, (3) C. This means prototype properties win over
    // B properties win over A win over C. This mirrors what would happen
    // with inheritance if element extended B extended A extended C.
    //
    // Again given, Polymer{ behaviors: [A, B, C, A, B]}, the resulting
    // `behaviors` array was [C, A, B].
    // Behavior lifecycle methods were called in behavior array order
    // followed by the element, e.g. (1) C.created, (2) A.created,
    // (3) B.created, (4) element.created. There was no support for
    // super, and "super-behavior" methods were callable only by name).
    //
    // 2.x
    // Behaviors are made into proper mixins which live in the
    // element's prototype chain. Behaviors are placed in the element prototype
    // eldest to youngest and de-duped youngest to oldest:
    // So, first [A, B, C, A, B] becomes [C, A, B] then,
    // the element prototype becomes (oldest) (1) PolymerElement, (2) class(C),
    // (3) class(A), (4) class(B), (5) class(Polymer({...})).
    // Result:
    // This means element properties win over B properties win over A win
    // over C. (same as 1.x)
    // If lifecycle is called (super then me), order is
    // (1) C.created, (2) A.created, (3) B.created, (4) element.created
    // (again same as 1.x)
    function _mixinBehaviors(behaviors, klass) {
      for (let i=0; i<behaviors.length; i++) {
        let b = behaviors[i];
        if (b) {
          klass = Array.isArray(b) ? _mixinBehaviors(b, klass) :
            GenerateClassFromInfo(b, klass);
        }
      }
      return klass;
    }

    /**
     * @param {Array} behaviors List of behaviors to flatten.
     * @param {Array=} list Target list to flatten behaviors into.
     * @param {Array=} exclude List of behaviors to exclude from the list.
     * @return {!Array} Returns the list of flattened behaviors.
     */
    function flattenBehaviors(behaviors, list, exclude) {
      list = list || [];
      for (let i=behaviors.length-1; i >= 0; i--) {
        let b = behaviors[i];
        if (b) {
          if (Array.isArray(b)) {
            flattenBehaviors(b, list);
          } else {
            // dedup
            if (list.indexOf(b) < 0 && (!exclude || exclude.indexOf(b) < 0)) {
              list.unshift(b);
            }
          }
        } else {
          console.warn('behavior is null, check for missing or 404 import');
        }
      }
      return list;
    }

    /**
     * @param {!PolymerInit} info Polymer info object
     * @param {function(new:HTMLElement)} Base base class to extend with info object
     * @return {function(new:HTMLElement)} Generated class
     * @suppress {checkTypes}
     * @private
     */
    function GenerateClassFromInfo(info, Base) {

      /** @private */
      class PolymerGenerated extends Base {

        static get properties() {
          return info.properties;
        }

        static get observers() {
          return info.observers;
        }

        /**
         * @return {HTMLTemplateElement} template for this class
         */
        static get template() {
          // get template first from any imperative set in `info._template`
          return info._template ||
            // next look in dom-module associated with this element's is.
            DomModule && DomModule.import(this.is, 'template') ||
            // next look for superclass template (note: use superclass symbol
            // to ensure correct `this.is`)
            Base.template ||
            // finally fall back to `_template` in element's prototype.
            this.prototype._template ||
            null;
        }

        /**
         * @return {void}
         */
        created() {
          super.created();
          if (info.created) {
            info.created.call(this);
          }
        }

        /**
         * @return {void}
         */
        _registered() {
          super._registered();
          /* NOTE: `beforeRegister` is called here for bc, but the behavior
           is different than in 1.x. In 1.0, the method was called *after*
           mixing prototypes together but *before* processing of meta-objects.
           However, dynamic effects can still be set here and can be done either
           in `beforeRegister` or `registered`. It is no longer possible to set
           `is` in `beforeRegister` as you could in 1.x.
          */
          if (info.beforeRegister) {
            info.beforeRegister.call(Object.getPrototypeOf(this));
          }
          if (info.registered) {
            info.registered.call(Object.getPrototypeOf(this));
          }
        }

        /**
         * @return {void}
         */
        _applyListeners() {
          super._applyListeners();
          if (info.listeners) {
            for (let l in info.listeners) {
              this._addMethodEventListenerToNode(this, l, info.listeners[l]);
            }
          }
        }

        // note: exception to "super then me" rule;
        // do work before calling super so that super attributes
        // only apply if not already set.
        /**
         * @return {void}
         */
        _ensureAttributes() {
          if (info.hostAttributes) {
            for (let a in info.hostAttributes) {
              this._ensureAttribute(a, info.hostAttributes[a]);
            }
          }
          super._ensureAttributes();
        }

        /**
         * @return {void}
         */
        ready() {
          super.ready();
          if (info.ready) {
            info.ready.call(this);
          }
        }

        /**
         * @return {void}
         */
        attached() {
          super.attached();
          if (info.attached) {
            info.attached.call(this);
          }
        }

        /**
         * @return {void}
         */
        detached() {
          super.detached();
          if (info.detached) {
            info.detached.call(this);
          }
        }

        /**
         * Implements native Custom Elements `attributeChangedCallback` to
         * set an attribute value to a property via `_attributeToProperty`.
         *
         * @param {string} name Name of attribute that changed
         * @param {?string} old Old attribute value
         * @param {?string} value New attribute value
         * @return {void}
         */
        attributeChanged(name, old, value) {
          super.attributeChanged(name, old, value);
          if (info.attributeChanged) {
            info.attributeChanged.call(this, name, old, value);
          }
       }
      }

      PolymerGenerated.generatedFrom = info;

      for (let p in info) {
        // NOTE: cannot copy `metaProps` methods onto prototype at least because
        // `super.ready` must be called and is not included in the user fn.
        if (!(p in metaProps)) {
          let pd = Object.getOwnPropertyDescriptor(info, p);
          if (pd) {
            Object.defineProperty(PolymerGenerated.prototype, p, pd);
          }
        }
      }

      return PolymerGenerated;
    }

    /**
     * Generates a class that extends `LegacyElement` based on the
     * provided info object.  Metadata objects on the `info` object
     * (`properties`, `observers`, `listeners`, `behaviors`, `is`) are used
     * for Polymer's meta-programming systems, and any functions are copied
     * to the generated class.
     *
     * Valid "metadata" values are as follows:
     *
     * `is`: String providing the tag name to register the element under. In
     * addition, if a `dom-module` with the same id exists, the first template
     * in that `dom-module` will be stamped into the shadow root of this element,
     * with support for declarative event listeners (`on-...`), Polymer data
     * bindings (`[[...]]` and `{{...}}`), and id-based node finding into
     * `this.$`.
     *
     * `properties`: Object describing property-related metadata used by Polymer
     * features (key: property names, value: object containing property metadata).
     * Valid keys in per-property metadata include:
     * - `type` (String|Number|Object|Array|...): Used by
     *   `attributeChangedCallback` to determine how string-based attributes
     *   are deserialized to JavaScript property values.
     * - `notify` (boolean): Causes a change in the property to fire a
     *   non-bubbling event called `<property>-changed`. Elements that have
     *   enabled two-way binding to the property use this event to observe changes.
     * - `readOnly` (boolean): Creates a getter for the property, but no setter.
     *   To set a read-only property, use the private setter method
     *   `_setProperty(property, value)`.
     * - `observer` (string): Observer method name that will be called when
     *   the property changes. The arguments of the method are
     *   `(value, previousValue)`.
     * - `computed` (string): String describing method and dependent properties
     *   for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
     *   Computed properties are read-only by default and can only be changed
     *   via the return value of the computing method.
     *
     * `observers`: Array of strings describing multi-property observer methods
     *  and their dependent properties (e.g. `'observeABC(a, b, c)'`).
     *
     * `listeners`: Object describing event listeners to be added to each
     *  instance of this element (key: event name, value: method name).
     *
     * `behaviors`: Array of additional `info` objects containing metadata
     * and callbacks in the same format as the `info` object here which are
     * merged into this element.
     *
     * `hostAttributes`: Object listing attributes to be applied to the host
     *  once created (key: attribute name, value: attribute value).  Values
     *  are serialized based on the type of the value.  Host attributes should
     *  generally be limited to attributes such as `tabIndex` and `aria-...`.
     *  Attributes in `hostAttributes` are only applied if a user-supplied
     *  attribute is not already present (attributes in markup override
     *  `hostAttributes`).
     *
     * In addition, the following Polymer-specific callbacks may be provided:
     * - `registered`: called after first instance of this element,
     * - `created`: called during `constructor`
     * - `attached`: called during `connectedCallback`
     * - `detached`: called during `disconnectedCallback`
     * - `ready`: called before first `attached`, after all properties of
     *   this element have been propagated to its template and all observers
     *   have run
     *
     * @param {!PolymerInit} info Object containing Polymer metadata and functions
     *   to become class methods.
     * @return {function(new:HTMLElement)} Generated class
     */
    const Class = function(info) {
      if (!info) {
        console.warn(`Polymer's Class function requires \`info\` argument`);
      }
      let klass = GenerateClassFromInfo(info, info.behaviors ?
        // note: mixinBehaviors ensures `LegacyElementMixin`.
        mixinBehaviors(info.behaviors, HTMLElement) :
        LegacyElementMixin(HTMLElement));
      // decorate klass with registration info
      klass.is = info.is;
      return klass;
    };

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Legacy class factory and registration helper for defining Polymer
     * elements.
     *
     * This method is equivalent to
     *
     *     import {Class} from '@polymer/polymer/lib/legacy/class.js';
     *     customElements.define(info.is, Class(info));
     *
     * See `Class` for details on valid legacy metadata format for `info`.
     *
     * @global
     * @override
     * @function
     * @param {!PolymerInit} info Object containing Polymer metadata and functions
     *   to become class methods.
     * @return {function(new: HTMLElement)} Generated class
     * @suppress {duplicate, invalidCasts, checkTypes}
     */
    const Polymer = function(info) {
      // if input is a `class` (aka a function with a prototype), use the prototype
      // remember that the `constructor` will never be called
      let klass;
      if (typeof info === 'function') {
        klass = info;
      } else {
        klass = Polymer.Class(info);
      }
      customElements.define(klass.is, /** @type {!HTMLElement} */(klass));
      return klass;
    };

    Polymer.Class = Class;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // Common implementation for mixin & behavior
    function mutablePropertyChange(inst, property, value, old, mutableData) {
      let isObject;
      if (mutableData) {
        isObject = (typeof value === 'object' && value !== null);
        // Pull `old` for Objects from temp cache, but treat `null` as a primitive
        if (isObject) {
          old = inst.__dataTemp[property];
        }
      }
      // Strict equality check, but return false for NaN===NaN
      let shouldChange = (old !== value && (old === old || value === value));
      // Objects are stored in temporary cache (cleared at end of
      // turn), which is used for dirty-checking
      if (isObject && shouldChange) {
        inst.__dataTemp[property] = value;
      }
      return shouldChange;
    }

    /**
     * Element class mixin to skip strict dirty-checking for objects and arrays
     * (always consider them to be "dirty"), for use on elements utilizing
     * `PropertyEffects`
     *
     * By default, `PropertyEffects` performs strict dirty checking on
     * objects, which means that any deep modifications to an object or array will
     * not be propagated unless "immutable" data patterns are used (i.e. all object
     * references from the root to the mutation were changed).
     *
     * Polymer also provides a proprietary data mutation and path notification API
     * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
     * mutation and notification of deep changes in an object graph to all elements
     * bound to the same object graph.
     *
     * In cases where neither immutable patterns nor the data mutation API can be
     * used, applying this mixin will cause Polymer to skip dirty checking for
     * objects and arrays (always consider them to be "dirty").  This allows a
     * user to make a deep modification to a bound object graph, and then either
     * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
     * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
     * elements that wish to be updated based on deep mutations must apply this
     * mixin or otherwise skip strict dirty checking for objects/arrays.
     * Specifically, any elements in the binding tree between the source of a
     * mutation and the consumption of it must apply this mixin or enable the
     * `OptionalMutableData` mixin.
     *
     * In order to make the dirty check strategy configurable, see
     * `OptionalMutableData`.
     *
     * Note, the performance characteristics of propagating large object graphs
     * will be worse as opposed to using strict dirty checking with immutable
     * patterns or Polymer's path notification API.
     *
     * @mixinFunction
     * @polymer
     * @summary Element class mixin to skip strict dirty-checking for objects
     *   and arrays
     */
    const MutableData = dedupingMixin(superClass => {

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_MutableData}
       */
      class MutableData extends superClass {
        /**
         * Overrides `PropertyEffects` to provide option for skipping
         * strict equality checking for Objects and Arrays.
         *
         * This method pulls the value to dirty check against from the `__dataTemp`
         * cache (rather than the normal `__data` cache) for Objects.  Since the temp
         * cache is cleared at the end of a turn, this implementation allows
         * side-effects of deep object changes to be processed by re-setting the
         * same object (using the temp cache as an in-turn backstop to prevent
         * cycles due to 2-way notification).
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         * @protected
         */
        _shouldPropertyChange(property, value, old) {
          return mutablePropertyChange(this, property, value, old, true);
        }

      }

      return MutableData;

    });

    /**
     * Element class mixin to add the optional ability to skip strict
     * dirty-checking for objects and arrays (always consider them to be
     * "dirty") by setting a `mutable-data` attribute on an element instance.
     *
     * By default, `PropertyEffects` performs strict dirty checking on
     * objects, which means that any deep modifications to an object or array will
     * not be propagated unless "immutable" data patterns are used (i.e. all object
     * references from the root to the mutation were changed).
     *
     * Polymer also provides a proprietary data mutation and path notification API
     * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
     * mutation and notification of deep changes in an object graph to all elements
     * bound to the same object graph.
     *
     * In cases where neither immutable patterns nor the data mutation API can be
     * used, applying this mixin will allow Polymer to skip dirty checking for
     * objects and arrays (always consider them to be "dirty").  This allows a
     * user to make a deep modification to a bound object graph, and then either
     * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
     * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
     * elements that wish to be updated based on deep mutations must apply this
     * mixin or otherwise skip strict dirty checking for objects/arrays.
     * Specifically, any elements in the binding tree between the source of a
     * mutation and the consumption of it must enable this mixin or apply the
     * `MutableData` mixin.
     *
     * While this mixin adds the ability to forgo Object/Array dirty checking,
     * the `mutableData` flag defaults to false and must be set on the instance.
     *
     * Note, the performance characteristics of propagating large object graphs
     * will be worse by relying on `mutableData: true` as opposed to using
     * strict dirty checking with immutable patterns or Polymer's path notification
     * API.
     *
     * @mixinFunction
     * @polymer
     * @summary Element class mixin to optionally skip strict dirty-checking
     *   for objects and arrays
     */
    const OptionalMutableData = dedupingMixin(superClass => {

      /**
       * @mixinClass
       * @polymer
       * @implements {Polymer_OptionalMutableData}
       */
      class OptionalMutableData extends superClass {

        static get properties() {
          return {
            /**
             * Instance-level flag for configuring the dirty-checking strategy
             * for this element.  When true, Objects and Arrays will skip dirty
             * checking, otherwise strict equality checking will be used.
             */
            mutableData: Boolean
          };
        }

        /**
         * Overrides `PropertyEffects` to provide option for skipping
         * strict equality checking for Objects and Arrays.
         *
         * When `this.mutableData` is true on this instance, this method
         * pulls the value to dirty check against from the `__dataTemp` cache
         * (rather than the normal `__data` cache) for Objects.  Since the temp
         * cache is cleared at the end of a turn, this implementation allows
         * side-effects of deep object changes to be processed by re-setting the
         * same object (using the temp cache as an in-turn backstop to prevent
         * cycles due to 2-way notification).
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         * @protected
         */
        _shouldPropertyChange(property, value, old) {
          return mutablePropertyChange(this, property, value, old, this.mutableData);
        }
      }

      return OptionalMutableData;

    });

    // Export for use by legacy behavior
    MutableData._mutablePropertyChange = mutablePropertyChange;

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // Base class for HTMLTemplateElement extension that has property effects
    // machinery for propagating host properties to children. This is an ES5
    // class only because Babel (incorrectly) requires super() in the class
    // constructor even though no `this` is used and it returns an instance.
    let newInstance = null;

    /**
     * @constructor
     * @extends {HTMLTemplateElement}
     * @private
     */
    function HTMLTemplateElementExtension() { return newInstance; }
    HTMLTemplateElementExtension.prototype = Object.create(HTMLTemplateElement.prototype, {
      constructor: {
        value: HTMLTemplateElementExtension,
        writable: true
      }
    });

    /**
     * @constructor
     * @implements {Polymer_PropertyEffects}
     * @extends {HTMLTemplateElementExtension}
     * @private
     */
    const DataTemplate = PropertyEffects(HTMLTemplateElementExtension);

    /**
     * @constructor
     * @implements {Polymer_MutableData}
     * @extends {DataTemplate}
     * @private
     */
    const MutableDataTemplate = MutableData(DataTemplate);

    // Applies a DataTemplate subclass to a <template> instance
    function upgradeTemplate(template, constructor) {
      newInstance = template;
      Object.setPrototypeOf(template, constructor.prototype);
      new constructor();
      newInstance = null;
    }

    /**
     * Base class for TemplateInstance.
     * @constructor
     * @implements {Polymer_PropertyEffects}
     * @private
     */
    const base = PropertyEffects(class {});

    /**
     * @polymer
     * @customElement
     * @appliesMixin PropertyEffects
     * @unrestricted
     */
    class TemplateInstanceBase extends base {
      constructor(props) {
        super();
        this._configureProperties(props);
        this.root = this._stampTemplate(this.__dataHost);
        // Save list of stamped children
        let children = this.children = [];
        for (let n = this.root.firstChild; n; n=n.nextSibling) {
          children.push(n);
          n.__templatizeInstance = this;
        }
        if (this.__templatizeOwner &&
          this.__templatizeOwner.__hideTemplateChildren__) {
          this._showHideChildren(true);
        }
        // Flush props only when props are passed if instance props exist
        // or when there isn't instance props.
        let options = this.__templatizeOptions;
        if ((props && options.instanceProps) || !options.instanceProps) {
          this._enableProperties();
        }
      }
      /**
       * Configure the given `props` by calling `_setPendingProperty`. Also
       * sets any properties stored in `__hostProps`.
       * @private
       * @param {Object} props Object of property name-value pairs to set.
       * @return {void}
       */
      _configureProperties(props) {
        let options = this.__templatizeOptions;
        if (options.forwardHostProp) {
          for (let hprop in this.__hostProps) {
            this._setPendingProperty(hprop, this.__dataHost['_host_' + hprop]);
          }
        }
        // Any instance props passed in the constructor will overwrite host props;
        // normally this would be a user error but we don't specifically filter them
        for (let iprop in props) {
          this._setPendingProperty(iprop, props[iprop]);
        }
      }
      /**
       * Forwards a host property to this instance.  This method should be
       * called on instances from the `options.forwardHostProp` callback
       * to propagate changes of host properties to each instance.
       *
       * Note this method enqueues the change, which are flushed as a batch.
       *
       * @param {string} prop Property or path name
       * @param {*} value Value of the property to forward
       * @return {void}
       */
      forwardHostProp(prop, value) {
        if (this._setPendingPropertyOrPath(prop, value, false, true)) {
          this.__dataHost._enqueueClient(this);
        }
      }

      /**
       * Override point for adding custom or simulated event handling.
       *
       * @param {!Node} node Node to add event listener to
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to add
       * @return {void}
       */
      _addEventListenerToNode(node, eventName, handler) {
        if (this._methodHost && this.__templatizeOptions.parentModel) {
          // If this instance should be considered a parent model, decorate
          // events this template instance as `model`
          this._methodHost._addEventListenerToNode(node, eventName, (e) => {
            e.model = this;
            handler(e);
          });
        } else {
          // Otherwise delegate to the template's host (which could be)
          // another template instance
          let templateHost = this.__dataHost.__dataHost;
          if (templateHost) {
            templateHost._addEventListenerToNode(node, eventName, handler);
          }
        }
      }
      /**
       * Shows or hides the template instance top level child elements. For
       * text nodes, `textContent` is removed while "hidden" and replaced when
       * "shown."
       * @param {boolean} hide Set to true to hide the children;
       * set to false to show them.
       * @return {void}
       * @protected
       */
      _showHideChildren(hide) {
        let c = this.children;
        for (let i=0; i<c.length; i++) {
          let n = c[i];
          // Ignore non-changes
          if (Boolean(hide) != Boolean(n.__hideTemplateChildren__)) {
            if (n.nodeType === Node.TEXT_NODE) {
              if (hide) {
                n.__polymerTextContent__ = n.textContent;
                n.textContent = '';
              } else {
                n.textContent = n.__polymerTextContent__;
              }
            // remove and replace slot
            } else if (n.localName === 'slot') {
              if (hide) {
                n.__polymerReplaced__ = document.createComment('hidden-slot');
                n.parentNode.replaceChild(n.__polymerReplaced__, n);
              } else {
                const replace = n.__polymerReplaced__;
                if (replace) {
                  replace.parentNode.replaceChild(n, replace);
                }
              }
            }

            else if (n.style) {
              if (hide) {
                n.__polymerDisplay__ = n.style.display;
                n.style.display = 'none';
              } else {
                n.style.display = n.__polymerDisplay__;
              }
            }
          }
          n.__hideTemplateChildren__ = hide;
          if (n._showHideChildren) {
            n._showHideChildren(hide);
          }
        }
      }
      /**
       * Overrides default property-effects implementation to intercept
       * textContent bindings while children are "hidden" and cache in
       * private storage for later retrieval.
       *
       * @param {!Node} node The node to set a property on
       * @param {string} prop The property to set
       * @param {*} value The value to set
       * @return {void}
       * @protected
       */
      _setUnmanagedPropertyToNode(node, prop, value) {
        if (node.__hideTemplateChildren__ &&
            node.nodeType == Node.TEXT_NODE && prop == 'textContent') {
          node.__polymerTextContent__ = value;
        } else {
          super._setUnmanagedPropertyToNode(node, prop, value);
        }
      }
      /**
       * Find the parent model of this template instance.  The parent model
       * is either another templatize instance that had option `parentModel: true`,
       * or else the host element.
       *
       * @return {!Polymer_PropertyEffects} The parent model of this instance
       */
      get parentModel() {
        let model = this.__parentModel;
        if (!model) {
          let options;
          model = this;
          do {
            // A template instance's `__dataHost` is a <template>
            // `model.__dataHost.__dataHost` is the template's host
            model = model.__dataHost.__dataHost;
          } while ((options = model.__templatizeOptions) && !options.parentModel);
          this.__parentModel = model;
        }
        return model;
      }

      /**
       * Stub of HTMLElement's `dispatchEvent`, so that effects that may
       * dispatch events safely no-op.
       *
       * @param {Event} event Event to dispatch
       * @return {boolean} Always true.
       */
       dispatchEvent(event) { // eslint-disable-line no-unused-vars
         return true;
      }
    }

    /** @type {!DataTemplate} */
    TemplateInstanceBase.prototype.__dataHost;
    /** @type {!TemplatizeOptions} */
    TemplateInstanceBase.prototype.__templatizeOptions;
    /** @type {!Polymer_PropertyEffects} */
    TemplateInstanceBase.prototype._methodHost;
    /** @type {!Object} */
    TemplateInstanceBase.prototype.__templatizeOwner;
    /** @type {!Object} */
    TemplateInstanceBase.prototype.__hostProps;

    /**
     * @constructor
     * @extends {TemplateInstanceBase}
     * @implements {Polymer_MutableData}
     * @private
     */
    const MutableTemplateInstanceBase = MutableData(TemplateInstanceBase);

    function findMethodHost(template) {
      // Technically this should be the owner of the outermost template.
      // In shadow dom, this is always getRootNode().host, but we can
      // approximate this via cooperation with our dataHost always setting
      // `_methodHost` as long as there were bindings (or id's) on this
      // instance causing it to get a dataHost.
      let templateHost = template.__dataHost;
      return templateHost && templateHost._methodHost || templateHost;
    }

    /* eslint-disable valid-jsdoc */
    /**
     * @suppress {missingProperties} class.prototype is not defined for some reason
     */
    function createTemplatizerClass(template, templateInfo, options) {
      // Anonymous class created by the templatize
      let base = options.mutableData ?
        MutableTemplateInstanceBase : TemplateInstanceBase;
      /**
       * @constructor
       * @extends {base}
       * @private
       */
      let klass = class extends base { };
      klass.prototype.__templatizeOptions = options;
      klass.prototype._bindTemplate(template);
      addNotifyEffects(klass, template, templateInfo, options);
      return klass;
    }

    /**
     * @suppress {missingProperties} class.prototype is not defined for some reason
     */
    function addPropagateEffects(template, templateInfo, options) {
      let userForwardHostProp = options.forwardHostProp;
      if (userForwardHostProp) {
        // Provide data API and property effects on memoized template class
        let klass = templateInfo.templatizeTemplateClass;
        if (!klass) {
          let base = options.mutableData ? MutableDataTemplate : DataTemplate;
          /** @private */
          klass = templateInfo.templatizeTemplateClass =
            class TemplatizedTemplate extends base {};
          // Add template - >instances effects
          // and host <- template effects
          let hostProps = templateInfo.hostProps;
          for (let prop in hostProps) {
            klass.prototype._addPropertyEffect('_host_' + prop,
              klass.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,
              {fn: createForwardHostPropEffect(prop, userForwardHostProp)});
            klass.prototype._createNotifyingProperty('_host_' + prop);
          }
        }
        upgradeTemplate(template, klass);
        // Mix any pre-bound data into __data; no need to flush this to
        // instances since they pull from the template at instance-time
        if (template.__dataProto) {
          // Note, generally `__dataProto` could be chained, but it's guaranteed
          // to not be since this is a vanilla template we just added effects to
          Object.assign(template.__data, template.__dataProto);
        }
        // Clear any pending data for performance
        template.__dataTemp = {};
        template.__dataPending = null;
        template.__dataOld = null;
        template._enableProperties();
      }
    }
    /* eslint-enable valid-jsdoc */

    function createForwardHostPropEffect(hostProp, userForwardHostProp) {
      return function forwardHostProp(template, prop, props) {
        userForwardHostProp.call(template.__templatizeOwner,
          prop.substring('_host_'.length), props[prop]);
      };
    }

    function addNotifyEffects(klass, template, templateInfo, options) {
      let hostProps = templateInfo.hostProps || {};
      for (let iprop in options.instanceProps) {
        delete hostProps[iprop];
        let userNotifyInstanceProp = options.notifyInstanceProp;
        if (userNotifyInstanceProp) {
          klass.prototype._addPropertyEffect(iprop,
            klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,
            {fn: createNotifyInstancePropEffect(iprop, userNotifyInstanceProp)});
        }
      }
      if (options.forwardHostProp && template.__dataHost) {
        for (let hprop in hostProps) {
          klass.prototype._addPropertyEffect(hprop,
            klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,
            {fn: createNotifyHostPropEffect()});
        }
      }
    }

    function createNotifyInstancePropEffect(instProp, userNotifyInstanceProp) {
      return function notifyInstanceProp(inst, prop, props) {
        userNotifyInstanceProp.call(inst.__templatizeOwner,
          inst, prop, props[prop]);
      };
    }

    function createNotifyHostPropEffect() {
      return function notifyHostProp(inst, prop, props) {
        inst.__dataHost._setPendingPropertyOrPath('_host_' + prop, props[prop], true, true);
      };
    }

    /**
     * Returns an anonymous `PropertyEffects` class bound to the
     * `<template>` provided.  Instancing the class will result in the
     * template being stamped into a document fragment stored as the instance's
     * `root` property, after which it can be appended to the DOM.
     *
     * Templates may utilize all Polymer data-binding features as well as
     * declarative event listeners.  Event listeners and inline computing
     * functions in the template will be called on the host of the template.
     *
     * The constructor returned takes a single argument dictionary of initial
     * property values to propagate into template bindings.  Additionally
     * host properties can be forwarded in, and instance properties can be
     * notified out by providing optional callbacks in the `options` dictionary.
     *
     * Valid configuration in `options` are as follows:
     *
     * - `forwardHostProp(property, value)`: Called when a property referenced
     *   in the template changed on the template's host. As this library does
     *   not retain references to templates instanced by the user, it is the
     *   templatize owner's responsibility to forward host property changes into
     *   user-stamped instances.  The `instance.forwardHostProp(property, value)`
     *    method on the generated class should be called to forward host
     *   properties into the template to prevent unnecessary property-changed
     *   notifications. Any properties referenced in the template that are not
     *   defined in `instanceProps` will be notified up to the template's host
     *   automatically.
     * - `instanceProps`: Dictionary of property names that will be added
     *   to the instance by the templatize owner.  These properties shadow any
     *   host properties, and changes within the template to these properties
     *   will result in `notifyInstanceProp` being called.
     * - `mutableData`: When `true`, the generated class will skip strict
     *   dirty-checking for objects and arrays (always consider them to be
     *   "dirty").
     * - `notifyInstanceProp(instance, property, value)`: Called when
     *   an instance property changes.  Users may choose to call `notifyPath`
     *   on e.g. the owner to notify the change.
     * - `parentModel`: When `true`, events handled by declarative event listeners
     *   (`on-event="handler"`) will be decorated with a `model` property pointing
     *   to the template instance that stamped it.  It will also be returned
     *   from `instance.parentModel` in cases where template instance nesting
     *   causes an inner model to shadow an outer model.
     *
     * All callbacks are called bound to the `owner`. Any context
     * needed for the callbacks (such as references to `instances` stamped)
     * should be stored on the `owner` such that they can be retrieved via
     * `this`.
     *
     * When `options.forwardHostProp` is declared as an option, any properties
     * referenced in the template will be automatically forwarded from the host of
     * the `<template>` to instances, with the exception of any properties listed in
     * the `options.instanceProps` object.  `instanceProps` are assumed to be
     * managed by the owner of the instances, either passed into the constructor
     * or set after the fact.  Note, any properties passed into the constructor will
     * always be set to the instance (regardless of whether they would normally
     * be forwarded from the host).
     *
     * Note that `templatize()` can be run only once for a given `<template>`.
     * Further calls will result in an error. Also, there is a special
     * behavior if the template was duplicated through a mechanism such as
     * `<dom-repeat>` or `<test-fixture>`. In this case, all calls to
     * `templatize()` return the same class for all duplicates of a template.
     * The class returned from `templatize()` is generated only once using
     * the `options` from the first call. This means that any `options`
     * provided to subsequent calls will be ignored. Therefore, it is very
     * important not to close over any variables inside the callbacks. Also,
     * arrow functions must be avoided because they bind the outer `this`.
     * Inside the callbacks, any contextual information can be accessed
     * through `this`, which points to the `owner`.
     *
     * @param {!HTMLTemplateElement} template Template to templatize
     * @param {Polymer_PropertyEffects=} owner Owner of the template instances;
     *   any optional callbacks will be bound to this owner.
     * @param {Object=} options Options dictionary (see summary for details)
     * @return {function(new:TemplateInstanceBase)} Generated class bound to the template
     *   provided
     * @suppress {invalidCasts}
     */
    function templatize(template, owner, options) {
      options = /** @type {!TemplatizeOptions} */(options || {});
      if (template.__templatizeOwner) {
        throw new Error('A <template> can only be templatized once');
      }
      template.__templatizeOwner = owner;
      const ctor = owner ? owner.constructor : TemplateInstanceBase;
      let templateInfo = ctor._parseTemplate(template);
      // Get memoized base class for the prototypical template, which
      // includes property effects for binding template & forwarding
      let baseClass = templateInfo.templatizeInstanceClass;
      if (!baseClass) {
        baseClass = createTemplatizerClass(template, templateInfo, options);
        templateInfo.templatizeInstanceClass = baseClass;
      }
      // Host property forwarding must be installed onto template instance
      addPropagateEffects(template, templateInfo, options);
      // Subclass base class and add reference for this specific template
      /** @private */
      let klass = class TemplateInstance extends baseClass {};
      klass.prototype._methodHost = findMethodHost(template);
      klass.prototype.__dataHost = template;
      klass.prototype.__templatizeOwner = owner;
      klass.prototype.__hostProps = templateInfo.hostProps;
      klass = /** @type {function(new:TemplateInstanceBase)} */(klass); //eslint-disable-line no-self-assign
      return klass;
    }

    /**
     * Returns the template "model" associated with a given element, which
     * serves as the binding scope for the template instance the element is
     * contained in. A template model is an instance of
     * `TemplateInstanceBase`, and should be used to manipulate data
     * associated with this template instance.
     *
     * Example:
     *
     *   let model = modelForElement(el);
     *   if (model.index < 10) {
     *     model.set('item.checked', true);
     *   }
     *
     * @param {HTMLTemplateElement} template The model will be returned for
     *   elements stamped from this template
     * @param {Node=} node Node for which to return a template model.
     * @return {TemplateInstanceBase} Template instance representing the
     *   binding scope for the element
     */
    function modelForElement(template, node) {
      let model;
      while (node) {
        // An element with a __templatizeInstance marks the top boundary
        // of a scope; walk up until we find one, and then ensure that
        // its __dataHost matches `this`, meaning this dom-repeat stamped it
        if ((model = node.__templatizeInstance)) {
          // Found an element stamped by another template; keep walking up
          // from its __dataHost
          if (model.__dataHost != template) {
            node = model.__dataHost;
          } else {
            return model;
          }
        } else {
          // Still in a template scope, keep going up until
          // a __templatizeInstance is found
          node = node.parentNode;
        }
      }
      return null;
    }

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * @constructor
     * @extends {HTMLElement}
     * @implements {Polymer_PropertyEffects}
     * @implements {Polymer_OptionalMutableData}
     * @implements {Polymer_GestureEventListeners}
     * @private
     */
    const domBindBase =
      GestureEventListeners(
        OptionalMutableData(
          PropertyEffects(HTMLElement)));

    /**
     * Custom element to allow using Polymer's template features (data binding,
     * declarative event listeners, etc.) in the main document without defining
     * a new custom element.
     *
     * `<template>` tags utilizing bindings may be wrapped with the `<dom-bind>`
     * element, which will immediately stamp the wrapped template into the main
     * document and bind elements to the `dom-bind` element itself as the
     * binding scope.
     *
     * @polymer
     * @customElement
     * @appliesMixin PropertyEffects
     * @appliesMixin OptionalMutableData
     * @appliesMixin GestureEventListeners
     * @extends {domBindBase}
     * @summary Custom element to allow using Polymer's template features (data
     *   binding, declarative event listeners, etc.) in the main document.
     */
    class DomBind extends domBindBase {

      static get observedAttributes() { return ['mutable-data']; }

      constructor() {
        super();
        this.root = null;
        this.$ = null;
        this.__children = null;
      }

      /** @return {void} */
      attributeChangedCallback() {
        // assumes only one observed attribute
        this.mutableData = true;
      }

      /** @return {void} */
      connectedCallback() {
        this.style.display = 'none';
        this.render();
      }

      /** @return {void} */
      disconnectedCallback() {
        this.__removeChildren();
      }

      __insertChildren() {
        this.parentNode.insertBefore(this.root, this);
      }

      __removeChildren() {
        if (this.__children) {
          for (let i=0; i<this.__children.length; i++) {
            this.root.appendChild(this.__children[i]);
          }
        }
      }

      /**
       * Forces the element to render its content. This is typically only
       * necessary to call if HTMLImports with the async attribute are used.
       * @return {void}
       */
      render() {
        let template;
        if (!this.__children) {
          template = /** @type {HTMLTemplateElement} */(template || this.querySelector('template'));
          if (!template) {
            // Wait until childList changes and template should be there by then
            let observer = new MutationObserver(() => {
              template = /** @type {HTMLTemplateElement} */(this.querySelector('template'));
              if (template) {
                observer.disconnect();
                this.render();
              } else {
                throw new Error('dom-bind requires a <template> child');
              }
            });
            observer.observe(this, {childList: true});
            return;
          }
          this.root = this._stampTemplate(template);
          this.$ = this.root.$;
          this.__children = [];
          for (let n=this.root.firstChild; n; n=n.nextSibling) {
            this.__children[this.__children.length] = n;
          }
          this._enableProperties();
        }
        this.__insertChildren();
        this.dispatchEvent(new CustomEvent('dom-change', {
          bubbles: true,
          composed: true
        }));
      }

    }

    customElements.define('dom-bind', DomBind);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * @constructor
     * @implements {Polymer_OptionalMutableData}
     * @extends {PolymerElement}
     * @private
     */
    const domRepeatBase = OptionalMutableData(PolymerElement);

    /**
     * The `<dom-repeat>` element will automatically stamp and binds one instance
     * of template content to each object in a user-provided array.
     * `dom-repeat` accepts an `items` property, and one instance of the template
     * is stamped for each item into the DOM at the location of the `dom-repeat`
     * element.  The `item` property will be set on each instance's binding
     * scope, thus templates should bind to sub-properties of `item`.
     *
     * Example:
     *
     * ```html
     * <dom-module id="employee-list">
     *
     *   <template>
     *
     *     <div> Employee list: </div>
     *     <dom-repeat items="{{employees}}">
     *       <template>
     *         <div>First name: <span>{{item.first}}</span></div>
     *         <div>Last name: <span>{{item.last}}</span></div>
     *       </template>
     *     </dom-repeat>
     *
     *   </template>
     *
     * </dom-module>
     * ```
     *
     * With the following custom element definition:
     *
     * ```js
     * class EmployeeList extends PolymerElement {
     *   static get is() { return 'employee-list'; }
     *   static get properties() {
     *     return {
     *       employees: {
     *         value() {
     *           return [
     *             {first: 'Bob', last: 'Smith'},
     *             {first: 'Sally', last: 'Johnson'},
     *             ...
     *           ];
     *         }
     *       }
     *     };
     *   }
     * }
     * ```
     *
     * Notifications for changes to items sub-properties will be forwarded to template
     * instances, which will update via the normal structured data notification system.
     *
     * Mutations to the `items` array itself should be made using the Array
     * mutation API's on the PropertyEffects mixin (`push`, `pop`, `splice`,
     * `shift`, `unshift`), and template instances will be kept in sync with the
     * data in the array.
     *
     * Events caught by event handlers within the `dom-repeat` template will be
     * decorated with a `model` property, which represents the binding scope for
     * each template instance.  The model should be used to manipulate data on the
     * instance, for example `event.model.set('item.checked', true);`.
     *
     * Alternatively, the model for a template instance for an element stamped by
     * a `dom-repeat` can be obtained using the `modelForElement` API on the
     * `dom-repeat` that stamped it, for example
     * `this.$.domRepeat.modelForElement(event.target).set('item.checked', true);`.
     * This may be useful for manipulating instance data of event targets obtained
     * by event handlers on parents of the `dom-repeat` (event delegation).
     *
     * A view-specific filter/sort may be applied to each `dom-repeat` by supplying a
     * `filter` and/or `sort` property.  This may be a string that names a function on
     * the host, or a function may be assigned to the property directly.  The functions
     * should implemented following the standard `Array` filter/sort API.
     *
     * In order to re-run the filter or sort functions based on changes to sub-fields
     * of `items`, the `observe` property may be set as a space-separated list of
     * `item` sub-fields that should cause a re-filter/sort when modified.  If
     * the filter or sort function depends on properties not contained in `items`,
     * the user should observe changes to those properties and call `render` to update
     * the view based on the dependency change.
     *
     * For example, for an `dom-repeat` with a filter of the following:
     *
     * ```js
     * isEngineer(item) {
     *   return item.type == 'engineer' || item.manager.type == 'engineer';
     * }
     * ```
     *
     * Then the `observe` property should be configured as follows:
     *
     * ```html
     * <dom-repeat items="{{employees}}" filter="isEngineer" observe="type manager.type">
     * ```
     *
     * @customElement
     * @polymer
     * @extends {domRepeatBase}
     * @appliesMixin OptionalMutableData
     * @summary Custom element for stamping instance of a template bound to
     *   items in an array.
     */
    class DomRepeat extends domRepeatBase {

      // Not needed to find template; can be removed once the analyzer
      // can find the tag name from customElements.define call
      static get is() { return 'dom-repeat'; }

      static get template() { return null; }

      static get properties() {

        /**
         * Fired whenever DOM is added or removed by this template (by
         * default, rendering occurs lazily).  To force immediate rendering, call
         * `render`.
         *
         * @event dom-change
         */
        return {

          /**
           * An array containing items determining how many instances of the template
           * to stamp and that that each template instance should bind to.
           */
          items: {
            type: Array
          },

          /**
           * The name of the variable to add to the binding scope for the array
           * element associated with a given template instance.
           */
          as: {
            type: String,
            value: 'item'
          },

          /**
           * The name of the variable to add to the binding scope with the index
           * of the instance in the sorted and filtered list of rendered items.
           * Note, for the index in the `this.items` array, use the value of the
           * `itemsIndexAs` property.
           */
          indexAs: {
            type: String,
            value: 'index'
          },

          /**
           * The name of the variable to add to the binding scope with the index
           * of the instance in the `this.items` array. Note, for the index of
           * this instance in the sorted and filtered list of rendered items,
           * use the value of the `indexAs` property.
           */
          itemsIndexAs: {
            type: String,
            value: 'itemsIndex'
          },

          /**
           * A function that should determine the sort order of the items.  This
           * property should either be provided as a string, indicating a method
           * name on the element's host, or else be an actual function.  The
           * function should match the sort function passed to `Array.sort`.
           * Using a sort function has no effect on the underlying `items` array.
           */
          sort: {
            type: Function,
            observer: '__sortChanged'
          },

          /**
           * A function that can be used to filter items out of the view.  This
           * property should either be provided as a string, indicating a method
           * name on the element's host, or else be an actual function.  The
           * function should match the sort function passed to `Array.filter`.
           * Using a filter function has no effect on the underlying `items` array.
           */
          filter: {
            type: Function,
            observer: '__filterChanged'
          },

          /**
           * When using a `filter` or `sort` function, the `observe` property
           * should be set to a space-separated list of the names of item
           * sub-fields that should trigger a re-sort or re-filter when changed.
           * These should generally be fields of `item` that the sort or filter
           * function depends on.
           */
          observe: {
            type: String,
            observer: '__observeChanged'
          },

          /**
           * When using a `filter` or `sort` function, the `delay` property
           * determines a debounce time in ms after a change to observed item
           * properties that must pass before the filter or sort is re-run.
           * This is useful in rate-limiting shuffling of the view when
           * item changes may be frequent.
           */
          delay: Number,

          /**
           * Count of currently rendered items after `filter` (if any) has been applied.
           * If "chunking mode" is enabled, `renderedItemCount` is updated each time a
           * set of template instances is rendered.
           *
           */
          renderedItemCount: {
            type: Number,
            notify: true,
            readOnly: true
          },

          /**
           * Defines an initial count of template instances to render after setting
           * the `items` array, before the next paint, and puts the `dom-repeat`
           * into "chunking mode".  The remaining items will be created and rendered
           * incrementally at each animation frame therof until all instances have
           * been rendered.
           */
          initialCount: {
            type: Number,
            observer: '__initializeChunking'
          },

          /**
           * When `initialCount` is used, this property defines a frame rate (in
           * fps) to target by throttling the number of instances rendered each
           * frame to not exceed the budget for the target frame rate.  The
           * framerate is effectively the number of `requestAnimationFrame`s that
           * it tries to allow to actually fire in a given second. It does this
           * by measuring the time between `rAF`s and continuously adjusting the
           * number of items created each `rAF` to maintain the target framerate.
           * Setting this to a higher number allows lower latency and higher
           * throughput for event handlers and other tasks, but results in a
           * longer time for the remaining items to complete rendering.
           */
          targetFramerate: {
            type: Number,
            value: 20
          },

          _targetFrameTime: {
            type: Number,
            computed: '__computeFrameTime(targetFramerate)'
          }

        };

      }

      static get observers() {
        return [ '__itemsChanged(items.*)' ];
      }

      constructor() {
        super();
        this.__instances = [];
        this.__limit = Infinity;
        this.__pool = [];
        this.__renderDebouncer = null;
        this.__itemsIdxToInstIdx = {};
        this.__chunkCount = null;
        this.__lastChunkTime = null;
        this.__sortFn = null;
        this.__filterFn = null;
        this.__observePaths = null;
        this.__ctor = null;
        this.__isDetached = true;
        this.template = null;
      }

      /**
       * @return {void}
       */
      disconnectedCallback() {
        super.disconnectedCallback();
        this.__isDetached = true;
        for (let i=0; i<this.__instances.length; i++) {
          this.__detachInstance(i);
        }
      }

      /**
       * @return {void}
       */
      connectedCallback() {
        super.connectedCallback();
        this.style.display = 'none';
        // only perform attachment if the element was previously detached.
        if (this.__isDetached) {
          this.__isDetached = false;
          let parent = this.parentNode;
          for (let i=0; i<this.__instances.length; i++) {
            this.__attachInstance(i, parent);
          }
        }
      }

      __ensureTemplatized() {
        // Templatizing (generating the instance constructor) needs to wait
        // until ready, since won't have its template content handed back to
        // it until then
        if (!this.__ctor) {
          let template = this.template = /** @type {HTMLTemplateElement} */(this.querySelector('template'));
          if (!template) {
            // // Wait until childList changes and template should be there by then
            let observer = new MutationObserver(() => {
              if (this.querySelector('template')) {
                observer.disconnect();
                this.__render();
              } else {
                throw new Error('dom-repeat requires a <template> child');
              }
            });
            observer.observe(this, {childList: true});
            return false;
          }
          // Template instance props that should be excluded from forwarding
          let instanceProps = {};
          instanceProps[this.as] = true;
          instanceProps[this.indexAs] = true;
          instanceProps[this.itemsIndexAs] = true;
          this.__ctor = templatize(template, this, {
            mutableData: this.mutableData,
            parentModel: true,
            instanceProps: instanceProps,
            /**
             * @this {this}
             * @param {string} prop Property to set
             * @param {*} value Value to set property to
             */
            forwardHostProp: function(prop, value) {
              let i$ = this.__instances;
              for (let i=0, inst; (i<i$.length) && (inst=i$[i]); i++) {
                inst.forwardHostProp(prop, value);
              }
            },
            /**
             * @this {this}
             * @param {Object} inst Instance to notify
             * @param {string} prop Property to notify
             * @param {*} value Value to notify
             */
            notifyInstanceProp: function(inst, prop, value) {
              if (matches(this.as, prop)) {
                let idx = inst[this.itemsIndexAs];
                if (prop == this.as) {
                  this.items[idx] = value;
                }
                let path = translate(this.as, 'items.' + idx, prop);
                this.notifyPath(path, value);
              }
            }
          });
        }
        return true;
      }

      __getMethodHost() {
        // Technically this should be the owner of the outermost template.
        // In shadow dom, this is always getRootNode().host, but we can
        // approximate this via cooperation with our dataHost always setting
        // `_methodHost` as long as there were bindings (or id's) on this
        // instance causing it to get a dataHost.
        return this.__dataHost._methodHost || this.__dataHost;
      }

      __functionFromPropertyValue(functionOrMethodName) {
        if (typeof functionOrMethodName === 'string') {
          let methodName = functionOrMethodName;
          let obj = this.__getMethodHost();
          return function() { return obj[methodName].apply(obj, arguments); };
        }

        return functionOrMethodName;
      }

      __sortChanged(sort) {
        this.__sortFn = this.__functionFromPropertyValue(sort);
        if (this.items) { this.__debounceRender(this.__render); }
      }

      __filterChanged(filter) {
        this.__filterFn = this.__functionFromPropertyValue(filter);
        if (this.items) { this.__debounceRender(this.__render); }
      }

      __computeFrameTime(rate) {
        return Math.ceil(1000/rate);
      }

      __initializeChunking() {
        if (this.initialCount) {
          this.__limit = this.initialCount;
          this.__chunkCount = this.initialCount;
          this.__lastChunkTime = performance.now();
        }
      }

      __tryRenderChunk() {
        // Debounced so that multiple calls through `_render` between animation
        // frames only queue one new rAF (e.g. array mutation & chunked render)
        if (this.items && this.__limit < this.items.length) {
          this.__debounceRender(this.__requestRenderChunk);
        }
      }

      __requestRenderChunk() {
        requestAnimationFrame(()=>this.__renderChunk());
      }

      __renderChunk() {
        // Simple auto chunkSize throttling algorithm based on feedback loop:
        // measure actual time between frames and scale chunk count by ratio
        // of target/actual frame time
        let currChunkTime = performance.now();
        let ratio = this._targetFrameTime / (currChunkTime - this.__lastChunkTime);
        this.__chunkCount = Math.round(this.__chunkCount * ratio) || 1;
        this.__limit += this.__chunkCount;
        this.__lastChunkTime = currChunkTime;
        this.__debounceRender(this.__render);
      }

      __observeChanged() {
        this.__observePaths = this.observe &&
          this.observe.replace('.*', '.').split(' ');
      }

      __itemsChanged(change) {
        if (this.items && !Array.isArray(this.items)) {
          console.warn('dom-repeat expected array for `items`, found', this.items);
        }
        // If path was to an item (e.g. 'items.3' or 'items.3.foo'), forward the
        // path to that instance synchronously (returns false for non-item paths)
        if (!this.__handleItemPath(change.path, change.value)) {
          // Otherwise, the array was reset ('items') or spliced ('items.splices'),
          // so queue a full refresh
          this.__initializeChunking();
          this.__debounceRender(this.__render);
        }
      }

      __handleObservedPaths(path) {
        // Handle cases where path changes should cause a re-sort/filter
        if (this.__sortFn || this.__filterFn) {
          if (!path) {
            // Always re-render if the item itself changed
            this.__debounceRender(this.__render, this.delay);
          } else if (this.__observePaths) {
            // Otherwise, re-render if the path changed matches an observed path
            let paths = this.__observePaths;
            for (let i=0; i<paths.length; i++) {
              if (path.indexOf(paths[i]) === 0) {
                this.__debounceRender(this.__render, this.delay);
              }
            }
          }
        }
      }

      /**
       * @param {function(this:DomRepeat)} fn Function to debounce.
       * @param {number=} delay Delay in ms to debounce by.
       */
      __debounceRender(fn, delay = 0) {
        this.__renderDebouncer = Debouncer.debounce(
              this.__renderDebouncer
            , delay > 0 ? timeOut.after(delay) : microTask
            , fn.bind(this));
        enqueueDebouncer(this.__renderDebouncer);
      }

      /**
       * Forces the element to render its content. Normally rendering is
       * asynchronous to a provoking change. This is done for efficiency so
       * that multiple changes trigger only a single render. The render method
       * should be called if, for example, template rendering is required to
       * validate application state.
       * @return {void}
       */
      render() {
        // Queue this repeater, then flush all in order
        this.__debounceRender(this.__render);
        flush$1();
      }

      __render() {
        if (!this.__ensureTemplatized()) {
          // No template found yet
          return;
        }
        this.__applyFullRefresh();
        // Reset the pool
        // TODO(kschaaf): Reuse pool across turns and nested templates
        // Now that objects/arrays are re-evaluated when set, we can safely
        // reuse pooled instances across turns, however we still need to decide
        // semantics regarding how long to hold, how many to hold, etc.
        this.__pool.length = 0;
        // Set rendered item count
        this._setRenderedItemCount(this.__instances.length);
        // Notify users
        this.dispatchEvent(new CustomEvent('dom-change', {
          bubbles: true,
          composed: true
        }));
        // Check to see if we need to render more items
        this.__tryRenderChunk();
      }

      __applyFullRefresh() {
        let items = this.items || [];
        let isntIdxToItemsIdx = new Array(items.length);
        for (let i=0; i<items.length; i++) {
          isntIdxToItemsIdx[i] = i;
        }
        // Apply user filter
        if (this.__filterFn) {
          isntIdxToItemsIdx = isntIdxToItemsIdx.filter((i, idx, array) =>
            this.__filterFn(items[i], idx, array));
        }
        // Apply user sort
        if (this.__sortFn) {
          isntIdxToItemsIdx.sort((a, b) => this.__sortFn(items[a], items[b]));
        }
        // items->inst map kept for item path forwarding
        const itemsIdxToInstIdx = this.__itemsIdxToInstIdx = {};
        let instIdx = 0;
        // Generate instances and assign items
        const limit = Math.min(isntIdxToItemsIdx.length, this.__limit);
        for (; instIdx<limit; instIdx++) {
          let inst = this.__instances[instIdx];
          let itemIdx = isntIdxToItemsIdx[instIdx];
          let item = items[itemIdx];
          itemsIdxToInstIdx[itemIdx] = instIdx;
          if (inst) {
            inst._setPendingProperty(this.as, item);
            inst._setPendingProperty(this.indexAs, instIdx);
            inst._setPendingProperty(this.itemsIndexAs, itemIdx);
            inst._flushProperties();
          } else {
            this.__insertInstance(item, instIdx, itemIdx);
          }
        }
        // Remove any extra instances from previous state
        for (let i=this.__instances.length-1; i>=instIdx; i--) {
          this.__detachAndRemoveInstance(i);
        }
      }

      __detachInstance(idx) {
        let inst = this.__instances[idx];
        for (let i=0; i<inst.children.length; i++) {
          let el = inst.children[i];
          inst.root.appendChild(el);
        }
        return inst;
      }

      __attachInstance(idx, parent) {
        let inst = this.__instances[idx];
        parent.insertBefore(inst.root, this);
      }

      __detachAndRemoveInstance(idx) {
        let inst = this.__detachInstance(idx);
        if (inst) {
          this.__pool.push(inst);
        }
        this.__instances.splice(idx, 1);
      }

      __stampInstance(item, instIdx, itemIdx) {
        let model = {};
        model[this.as] = item;
        model[this.indexAs] = instIdx;
        model[this.itemsIndexAs] = itemIdx;
        return new this.__ctor(model);
      }

      __insertInstance(item, instIdx, itemIdx) {
        let inst = this.__pool.pop();
        if (inst) {
          // TODO(kschaaf): If the pool is shared across turns, hostProps
          // need to be re-set to reused instances in addition to item
          inst._setPendingProperty(this.as, item);
          inst._setPendingProperty(this.indexAs, instIdx);
          inst._setPendingProperty(this.itemsIndexAs, itemIdx);
          inst._flushProperties();
        } else {
          inst = this.__stampInstance(item, instIdx, itemIdx);
        }
        let beforeRow = this.__instances[instIdx + 1];
        let beforeNode = beforeRow ? beforeRow.children[0] : this;
        this.parentNode.insertBefore(inst.root, beforeNode);
        this.__instances[instIdx] = inst;
        return inst;
      }

      // Implements extension point from Templatize mixin
      /**
       * Shows or hides the template instance top level child elements. For
       * text nodes, `textContent` is removed while "hidden" and replaced when
       * "shown."
       * @param {boolean} hidden Set to true to hide the children;
       * set to false to show them.
       * @return {void}
       * @protected
       */
      _showHideChildren(hidden) {
        for (let i=0; i<this.__instances.length; i++) {
          this.__instances[i]._showHideChildren(hidden);
        }
      }

      // Called as a side effect of a host items.<key>.<path> path change,
      // responsible for notifying item.<path> changes to inst for key
      __handleItemPath(path, value) {
        let itemsPath = path.slice(6); // 'items.'.length == 6
        let dot = itemsPath.indexOf('.');
        let itemsIdx = dot < 0 ? itemsPath : itemsPath.substring(0, dot);
        // If path was index into array...
        if (itemsIdx == parseInt(itemsIdx, 10)) {
          let itemSubPath = dot < 0 ? '' : itemsPath.substring(dot+1);
          // If the path is observed, it will trigger a full refresh
          this.__handleObservedPaths(itemSubPath);
          // Note, even if a rull refresh is triggered, always do the path
          // notification because unless mutableData is used for dom-repeat
          // and all elements in the instance subtree, a full refresh may
          // not trigger the proper update.
          let instIdx = this.__itemsIdxToInstIdx[itemsIdx];
          let inst = this.__instances[instIdx];
          if (inst) {
            let itemPath = this.as + (itemSubPath ? '.' + itemSubPath : '');
            // This is effectively `notifyPath`, but avoids some of the overhead
            // of the public API
            inst._setPendingPropertyOrPath(itemPath, value, false, true);
            inst._flushProperties();
          }
          return true;
        }
      }

      /**
       * Returns the item associated with a given element stamped by
       * this `dom-repeat`.
       *
       * Note, to modify sub-properties of the item,
       * `modelForElement(el).set('item.<sub-prop>', value)`
       * should be used.
       *
       * @param {!HTMLElement} el Element for which to return the item.
       * @return {*} Item associated with the element.
       */
      itemForElement(el) {
        let instance = this.modelForElement(el);
        return instance && instance[this.as];
      }

      /**
       * Returns the inst index for a given element stamped by this `dom-repeat`.
       * If `sort` is provided, the index will reflect the sorted order (rather
       * than the original array order).
       *
       * @param {!HTMLElement} el Element for which to return the index.
       * @return {?number} Row index associated with the element (note this may
       *   not correspond to the array index if a user `sort` is applied).
       */
      indexForElement(el) {
        let instance = this.modelForElement(el);
        return instance && instance[this.indexAs];
      }

      /**
       * Returns the template "model" associated with a given element, which
       * serves as the binding scope for the template instance the element is
       * contained in. A template model
       * should be used to manipulate data associated with this template instance.
       *
       * Example:
       *
       *   let model = modelForElement(el);
       *   if (model.index < 10) {
       *     model.set('item.checked', true);
       *   }
       *
       * @param {!HTMLElement} el Element for which to return a template model.
       * @return {TemplateInstanceBase} Model representing the binding scope for
       *   the element.
       */
      modelForElement(el) {
        return modelForElement(this.template, el);
      }

    }

    customElements.define(DomRepeat.is, DomRepeat);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * The `<dom-if>` element will stamp a light-dom `<template>` child when
     * the `if` property becomes truthy, and the template can use Polymer
     * data-binding and declarative event features when used in the context of
     * a Polymer element's template.
     *
     * When `if` becomes falsy, the stamped content is hidden but not
     * removed from dom. When `if` subsequently becomes truthy again, the content
     * is simply re-shown. This approach is used due to its favorable performance
     * characteristics: the expense of creating template content is paid only
     * once and lazily.
     *
     * Set the `restamp` property to true to force the stamped content to be
     * created / destroyed when the `if` condition changes.
     *
     * @customElement
     * @polymer
     * @extends PolymerElement
     * @summary Custom element that conditionally stamps and hides or removes
     *   template content based on a boolean flag.
     */
    class DomIf extends PolymerElement {

      // Not needed to find template; can be removed once the analyzer
      // can find the tag name from customElements.define call
      static get is() { return 'dom-if'; }

      static get template() { return null; }

      static get properties() {

        return {

          /**
           * Fired whenever DOM is added or removed/hidden by this template (by
           * default, rendering occurs lazily).  To force immediate rendering, call
           * `render`.
           *
           * @event dom-change
           */

          /**
           * A boolean indicating whether this template should stamp.
           */
          if: {
            type: Boolean,
            observer: '__debounceRender'
          },

          /**
           * When true, elements will be removed from DOM and discarded when `if`
           * becomes false and re-created and added back to the DOM when `if`
           * becomes true.  By default, stamped elements will be hidden but left
           * in the DOM when `if` becomes false, which is generally results
           * in better performance.
           */
          restamp: {
            type: Boolean,
            observer: '__debounceRender'
          }

        };

      }

      constructor() {
        super();
        this.__renderDebouncer = null;
        this.__invalidProps = null;
        this.__instance = null;
        this._lastIf = false;
        this.__ctor = null;
      }

      __debounceRender() {
        // Render is async for 2 reasons:
        // 1. To eliminate dom creation trashing if user code thrashes `if` in the
        //    same turn. This was more common in 1.x where a compound computed
        //    property could result in the result changing multiple times, but is
        //    mitigated to a large extent by batched property processing in 2.x.
        // 2. To avoid double object propagation when a bag including values bound
        //    to the `if` property as well as one or more hostProps could enqueue
        //    the <dom-if> to flush before the <template>'s host property
        //    forwarding. In that scenario creating an instance would result in
        //    the host props being set once, and then the enqueued changes on the
        //    template would set properties a second time, potentially causing an
        //    object to be set to an instance more than once.  Creating the
        //    instance async from flushing data ensures this doesn't happen. If
        //    we wanted a sync option in the future, simply having <dom-if> flush
        //    (or clear) its template's pending host properties before creating
        //    the instance would also avoid the problem.
        this.__renderDebouncer = Debouncer.debounce(
              this.__renderDebouncer
            , microTask
            , () => this.__render());
        enqueueDebouncer(this.__renderDebouncer);
      }

      /**
       * @return {void}
       */
      disconnectedCallback() {
        super.disconnectedCallback();
        if (!this.parentNode ||
            (this.parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE &&
             !this.parentNode.host)) {
          this.__teardownInstance();
        }
      }

      /**
       * @return {void}
       */
      connectedCallback() {
        super.connectedCallback();
        this.style.display = 'none';
        if (this.if) {
          this.__debounceRender();
        }
      }

      /**
       * Forces the element to render its content. Normally rendering is
       * asynchronous to a provoking change. This is done for efficiency so
       * that multiple changes trigger only a single render. The render method
       * should be called if, for example, template rendering is required to
       * validate application state.
       * @return {void}
       */
      render() {
        flush$1();
      }

      __render() {
        if (this.if) {
          if (!this.__ensureInstance()) {
            // No template found yet
            return;
          }
          this._showHideChildren();
        } else if (this.restamp) {
          this.__teardownInstance();
        }
        if (!this.restamp && this.__instance) {
          this._showHideChildren();
        }
        if (this.if != this._lastIf) {
          this.dispatchEvent(new CustomEvent('dom-change', {
            bubbles: true,
            composed: true
          }));
          this._lastIf = this.if;
        }
      }

      __ensureInstance() {
        let parentNode = this.parentNode;
        // Guard against element being detached while render was queued
        if (parentNode) {
          if (!this.__ctor) {
            let template = /** @type {HTMLTemplateElement} */(this.querySelector('template'));
            if (!template) {
              // Wait until childList changes and template should be there by then
              let observer = new MutationObserver(() => {
                if (this.querySelector('template')) {
                  observer.disconnect();
                  this.__render();
                } else {
                  throw new Error('dom-if requires a <template> child');
                }
              });
              observer.observe(this, {childList: true});
              return false;
            }
            this.__ctor = templatize(template, this, {
              // dom-if templatizer instances require `mutable: true`, as
              // `__syncHostProperties` relies on that behavior to sync objects
              mutableData: true,
              /**
               * @param {string} prop Property to forward
               * @param {*} value Value of property
               * @this {this}
               */
              forwardHostProp: function(prop, value) {
                if (this.__instance) {
                  if (this.if) {
                    this.__instance.forwardHostProp(prop, value);
                  } else {
                    // If we have an instance but are squelching host property
                    // forwarding due to if being false, note the invalidated
                    // properties so `__syncHostProperties` can sync them the next
                    // time `if` becomes true
                    this.__invalidProps = this.__invalidProps || Object.create(null);
                    this.__invalidProps[root(prop)] = true;
                  }
                }
              }
            });
          }
          if (!this.__instance) {
            this.__instance = new this.__ctor();
            parentNode.insertBefore(this.__instance.root, this);
          } else {
            this.__syncHostProperties();
            let c$ = this.__instance.children;
            if (c$ && c$.length) {
              // Detect case where dom-if was re-attached in new position
              let lastChild = this.previousSibling;
              if (lastChild !== c$[c$.length-1]) {
                for (let i=0, n; (i<c$.length) && (n=c$[i]); i++) {
                  parentNode.insertBefore(n, this);
                }
              }
            }
          }
        }
        return true;
      }

      __syncHostProperties() {
        let props = this.__invalidProps;
        if (props) {
          for (let prop in props) {
            this.__instance._setPendingProperty(prop, this.__dataHost[prop]);
          }
          this.__invalidProps = null;
          this.__instance._flushProperties();
        }
      }

      __teardownInstance() {
        if (this.__instance) {
          let c$ = this.__instance.children;
          if (c$ && c$.length) {
            // use first child parent, for case when dom-if may have been detached
            let parent = c$[0].parentNode;
            for (let i=0, n; (i<c$.length) && (n=c$[i]); i++) {
              parent.removeChild(n);
            }
          }
          this.__instance = null;
          this.__invalidProps = null;
        }
      }

      /**
       * Shows or hides the template instance top level child elements. For
       * text nodes, `textContent` is removed while "hidden" and replaced when
       * "shown."
       * @return {void}
       * @protected
       */
      _showHideChildren() {
        let hidden = this.__hideTemplateChildren__ || !this.if;
        if (this.__instance) {
          this.__instance._showHideChildren(hidden);
        }
      }

    }

    customElements.define(DomIf.is, DomIf);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    /**
     * Element mixin for recording dynamic associations between item paths in a
     * master `items` array and a `selected` array such that path changes to the
     * master array (at the host) element or elsewhere via data-binding) are
     * correctly propagated to items in the selected array and vice-versa.
     *
     * The `items` property accepts an array of user data, and via the
     * `select(item)` and `deselect(item)` API, updates the `selected` property
     * which may be bound to other parts of the application, and any changes to
     * sub-fields of `selected` item(s) will be kept in sync with items in the
     * `items` array.  When `multi` is false, `selected` is a property
     * representing the last selected item.  When `multi` is true, `selected`
     * is an array of multiply selected items.
     *
     * @polymer
     * @mixinFunction
     * @appliesMixin ElementMixin
     * @summary Element mixin for recording dynamic associations between item paths in a
     * master `items` array and a `selected` array
     */
    let ArraySelectorMixin = dedupingMixin(superClass => {

      /**
       * @constructor
       * @extends {superClass}
       * @implements {Polymer_ElementMixin}
       * @private
       */
      let elementBase = ElementMixin(superClass);

      /**
       * @polymer
       * @mixinClass
       * @implements {Polymer_ArraySelectorMixin}
       * @unrestricted
       */
      class ArraySelectorMixin extends elementBase {

        static get properties() {

          return {

            /**
             * An array containing items from which selection will be made.
             */
            items: {
              type: Array,
            },

            /**
             * When `true`, multiple items may be selected at once (in this case,
             * `selected` is an array of currently selected items).  When `false`,
             * only one item may be selected at a time.
             */
            multi: {
              type: Boolean,
              value: false,
            },

            /**
             * When `multi` is true, this is an array that contains any selected.
             * When `multi` is false, this is the currently selected item, or `null`
             * if no item is selected.
             * @type {?(Object|Array<!Object>)}
             */
            selected: {
              type: Object,
              notify: true
            },

            /**
             * When `multi` is false, this is the currently selected item, or `null`
             * if no item is selected.
             * @type {?Object}
             */
            selectedItem: {
              type: Object,
              notify: true
            },

            /**
             * When `true`, calling `select` on an item that is already selected
             * will deselect the item.
             */
            toggle: {
              type: Boolean,
              value: false
            }

          };
        }

        static get observers() {
          return ['__updateSelection(multi, items.*)'];
        }

        constructor() {
          super();
          this.__lastItems = null;
          this.__lastMulti = null;
          this.__selectedMap = null;
        }

        __updateSelection(multi, itemsInfo) {
          let path = itemsInfo.path;
          if (path == 'items') {
            // Case 1 - items array changed, so diff against previous array and
            // deselect any removed items and adjust selected indices
            let newItems = itemsInfo.base || [];
            let lastItems = this.__lastItems;
            let lastMulti = this.__lastMulti;
            if (multi !== lastMulti) {
              this.clearSelection();
            }
            if (lastItems) {
              let splices = calculateSplices(newItems, lastItems);
              this.__applySplices(splices);
            }
            this.__lastItems = newItems;
            this.__lastMulti = multi;
          } else if (itemsInfo.path == 'items.splices') {
            // Case 2 - got specific splice information describing the array mutation:
            // deselect any removed items and adjust selected indices
            this.__applySplices(itemsInfo.value.indexSplices);
          } else {
            // Case 3 - an array element was changed, so deselect the previous
            // item for that index if it was previously selected
            let part = path.slice('items.'.length);
            let idx = parseInt(part, 10);
            if ((part.indexOf('.') < 0) && part == idx) {
              this.__deselectChangedIdx(idx);
            }
          }
        }

        __applySplices(splices) {
          let selected = this.__selectedMap;
          // Adjust selected indices and mark removals
          for (let i=0; i<splices.length; i++) {
            let s = splices[i];
            selected.forEach((idx, item) => {
              if (idx < s.index) ; else if (idx >= s.index + s.removed.length) {
                // adjust index
                selected.set(item, idx + s.addedCount - s.removed.length);
              } else {
                // remove index
                selected.set(item, -1);
              }
            });
            for (let j=0; j<s.addedCount; j++) {
              let idx = s.index + j;
              if (selected.has(this.items[idx])) {
                selected.set(this.items[idx], idx);
              }
            }
          }
          // Update linked paths
          this.__updateLinks();
          // Remove selected items that were removed from the items array
          let sidx = 0;
          selected.forEach((idx, item) => {
            if (idx < 0) {
              if (this.multi) {
                this.splice('selected', sidx, 1);
              } else {
                this.selected = this.selectedItem = null;
              }
              selected.delete(item);
            } else {
              sidx++;
            }
          });
        }

        __updateLinks() {
          this.__dataLinkedPaths = {};
          if (this.multi) {
            let sidx = 0;
            this.__selectedMap.forEach(idx => {
              if (idx >= 0) {
                this.linkPaths('items.' + idx, 'selected.' + sidx++);
              }
            });
          } else {
            this.__selectedMap.forEach(idx => {
              this.linkPaths('selected', 'items.' + idx);
              this.linkPaths('selectedItem', 'items.' + idx);
            });
          }
        }

        /**
         * Clears the selection state.
         * @return {void}
         */
        clearSelection() {
          // Unbind previous selection
          this.__dataLinkedPaths = {};
          // The selected map stores 3 pieces of information:
          // key: items array object
          // value: items array index
          // order: selected array index
          this.__selectedMap = new Map();
          // Initialize selection
          this.selected = this.multi ? [] : null;
          this.selectedItem = null;
        }

        /**
         * Returns whether the item is currently selected.
         *
         * @param {*} item Item from `items` array to test
         * @return {boolean} Whether the item is selected
         */
        isSelected(item) {
          return this.__selectedMap.has(item);
        }

        /**
         * Returns whether the item is currently selected.
         *
         * @param {number} idx Index from `items` array to test
         * @return {boolean} Whether the item is selected
         */
        isIndexSelected(idx) {
          return this.isSelected(this.items[idx]);
        }

        __deselectChangedIdx(idx) {
          let sidx = this.__selectedIndexForItemIndex(idx);
          if (sidx >= 0) {
            let i = 0;
            this.__selectedMap.forEach((idx, item) => {
              if (sidx == i++) {
                this.deselect(item);
              }
            });
          }
        }

        __selectedIndexForItemIndex(idx) {
          let selected = this.__dataLinkedPaths['items.' + idx];
          if (selected) {
            return parseInt(selected.slice('selected.'.length), 10);
          }
        }

        /**
         * Deselects the given item if it is already selected.
         *
         * @param {*} item Item from `items` array to deselect
         * @return {void}
         */
        deselect(item) {
          let idx = this.__selectedMap.get(item);
          if (idx >= 0) {
            this.__selectedMap.delete(item);
            let sidx;
            if (this.multi) {
              sidx = this.__selectedIndexForItemIndex(idx);
            }
            this.__updateLinks();
            if (this.multi) {
              this.splice('selected', sidx, 1);
            } else {
              this.selected = this.selectedItem = null;
            }
          }
        }

        /**
         * Deselects the given index if it is already selected.
         *
         * @param {number} idx Index from `items` array to deselect
         * @return {void}
         */
        deselectIndex(idx) {
          this.deselect(this.items[idx]);
        }

        /**
         * Selects the given item.  When `toggle` is true, this will automatically
         * deselect the item if already selected.
         *
         * @param {*} item Item from `items` array to select
         * @return {void}
         */
        select(item) {
          this.selectIndex(this.items.indexOf(item));
        }

        /**
         * Selects the given index.  When `toggle` is true, this will automatically
         * deselect the item if already selected.
         *
         * @param {number} idx Index from `items` array to select
         * @return {void}
         */
        selectIndex(idx) {
          let item = this.items[idx];
          if (!this.isSelected(item)) {
            if (!this.multi) {
              this.__selectedMap.clear();
            }
            this.__selectedMap.set(item, idx);
            this.__updateLinks();
            if (this.multi) {
              this.push('selected', item);
            } else {
              this.selected = this.selectedItem = item;
            }
          } else if (this.toggle) {
            this.deselectIndex(idx);
          }
        }

      }

      return ArraySelectorMixin;

    });

    /**
     * @constructor
     * @extends {PolymerElement}
     * @implements {Polymer_ArraySelectorMixin}
     * @private
     */
    let baseArraySelector = ArraySelectorMixin(PolymerElement);

    /**
     * Element implementing the `ArraySelector` mixin, which records
     * dynamic associations between item paths in a master `items` array and a
     * `selected` array such that path changes to the master array (at the host)
     * element or elsewhere via data-binding) are correctly propagated to items
     * in the selected array and vice-versa.
     *
     * The `items` property accepts an array of user data, and via the
     * `select(item)` and `deselect(item)` API, updates the `selected` property
     * which may be bound to other parts of the application, and any changes to
     * sub-fields of `selected` item(s) will be kept in sync with items in the
     * `items` array.  When `multi` is false, `selected` is a property
     * representing the last selected item.  When `multi` is true, `selected`
     * is an array of multiply selected items.
     *
     * Example:
     *
     * ```js
     * import {PolymerElement} from '@polymer/polymer';
     * import '@polymer/polymer/lib/elements/array-selector.js';
     *
     * class EmployeeList extends PolymerElement {
     *   static get _template() {
     *     return html`
     *         <div> Employee list: </div>
     *         <dom-repeat id="employeeList" items="{{employees}}">
     *           <template>
     *             <div>First name: <span>{{item.first}}</span></div>
     *               <div>Last name: <span>{{item.last}}</span></div>
     *               <button on-click="toggleSelection">Select</button>
     *           </template>
     *         </dom-repeat>
     *
     *         <array-selector id="selector"
     *                         items="{{employees}}"
     *                         selected="{{selected}}"
     *                         multi toggle></array-selector>
     *
     *         <div> Selected employees: </div>
     *         <dom-repeat items="{{selected}}">
     *           <template>
     *             <div>First name: <span>{{item.first}}</span></div>
     *             <div>Last name: <span>{{item.last}}</span></div>
     *           </template>
     *         </dom-repeat>`;
     *   }
     *   static get is() { return 'employee-list'; }
     *   static get properties() {
     *     return {
     *       employees: {
     *         value() {
     *           return [
     *             {first: 'Bob', last: 'Smith'},
     *             {first: 'Sally', last: 'Johnson'},
     *             ...
     *           ];
     *         }
     *       }
     *     };
     *   }
     *   toggleSelection(e) {
     *     const item = this.$.employeeList.itemForElement(e.target);
     *     this.$.selector.select(item);
     *   }
     * }
     * ```
     *
     * @polymer
     * @customElement
     * @extends {baseArraySelector}
     * @appliesMixin ArraySelectorMixin
     * @summary Custom element that links paths between an input `items` array and
     *   an output `selected` item or array based on calls to its selection API.
     */
    class ArraySelector extends baseArraySelector {
      // Not needed to find template; can be removed once the analyzer
      // can find the tag name from customElements.define call
      static get is() { return 'array-selector'; }
    }
    customElements.define(ArraySelector.is, ArraySelector);

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    let mutablePropertyChange$1;
    /** @suppress {missingProperties} */
    (() => {
      mutablePropertyChange$1 = MutableData._mutablePropertyChange;
    })();

    /**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */

    // bc
    const Base = LegacyElementMixin(HTMLElement).prototype;

    /**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    */

    /**
    The `<iron-flex-layout>` component provides simple ways to use
    [CSS flexible box
    layout](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Flexible_boxes),
    also known as flexbox. Note that this is an old element, that was written
    before all modern browsers had non-prefixed flex styles. As such, nowadays you
    don't really need to use this element anymore, and can use CSS flex styles
    directly in your code.

    This component provides two different ways to use flexbox:

    1. [Layout
    classes](https://github.com/PolymerElements/iron-flex-layout/tree/master/iron-flex-layout-classes.html).
    The layout class stylesheet provides a simple set of class-based flexbox rules,
    that let you specify layout properties directly in markup. You must include this
    file in every element that needs to use them.

        Sample use:

        ```
        <custom-element-demo>
          <template>
            <script src="../webcomponentsjs/webcomponents-lite.js"></script>
            <next-code-block></next-code-block>
          </template>
        </custom-element-demo>
        ```

        ```js
        import {html} from '@polymer/polymer/lib/utils/html-tag.js';
        import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';

        const template = html`
          <style is="custom-style" include="iron-flex iron-flex-alignment"></style>
          <style>
            .test { width: 100px; }
          </style>
          <div class="layout horizontal center-center">
            <div class="test">horizontal layout center alignment</div>
          </div>
        `;
        document.body.appendChild(template.content);
        ```

    2. [Custom CSS
    mixins](https://github.com/PolymerElements/iron-flex-layout/blob/master/iron-flex-layout.html).
    The mixin stylesheet includes custom CSS mixins that can be applied inside a CSS
    rule using the `@apply` function.

    Please note that the old [/deep/ layout
    classes](https://github.com/PolymerElements/iron-flex-layout/tree/master/classes)
    are deprecated, and should not be used. To continue using layout properties
    directly in markup, please switch to using the new `dom-module`-based
    [layout
    classes](https://github.com/PolymerElements/iron-flex-layout/tree/master/iron-flex-layout-classes.html).
    Please note that the new version does not use `/deep/`, and therefore requires
    you to import the `dom-modules` in every element that needs to use them.

    @group Iron Elements
    @pseudoElement iron-flex-layout
    @demo demo/index.html
    */
    const template = html$1`
<custom-style>
  <style is="custom-style">
    [hidden] {
      display: none !important;
    }
  </style>
</custom-style>
<custom-style>
  <style is="custom-style">
    html {

      --layout: {
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
      };

      --layout-inline: {
        display: -ms-inline-flexbox;
        display: -webkit-inline-flex;
        display: inline-flex;
      };

      --layout-horizontal: {
        @apply --layout;

        -ms-flex-direction: row;
        -webkit-flex-direction: row;
        flex-direction: row;
      };

      --layout-horizontal-reverse: {
        @apply --layout;

        -ms-flex-direction: row-reverse;
        -webkit-flex-direction: row-reverse;
        flex-direction: row-reverse;
      };

      --layout-vertical: {
        @apply --layout;

        -ms-flex-direction: column;
        -webkit-flex-direction: column;
        flex-direction: column;
      };

      --layout-vertical-reverse: {
        @apply --layout;

        -ms-flex-direction: column-reverse;
        -webkit-flex-direction: column-reverse;
        flex-direction: column-reverse;
      };

      --layout-wrap: {
        -ms-flex-wrap: wrap;
        -webkit-flex-wrap: wrap;
        flex-wrap: wrap;
      };

      --layout-wrap-reverse: {
        -ms-flex-wrap: wrap-reverse;
        -webkit-flex-wrap: wrap-reverse;
        flex-wrap: wrap-reverse;
      };

      --layout-flex-auto: {
        -ms-flex: 1 1 auto;
        -webkit-flex: 1 1 auto;
        flex: 1 1 auto;
      };

      --layout-flex-none: {
        -ms-flex: none;
        -webkit-flex: none;
        flex: none;
      };

      --layout-flex: {
        -ms-flex: 1 1 0.000000001px;
        -webkit-flex: 1;
        flex: 1;
        -webkit-flex-basis: 0.000000001px;
        flex-basis: 0.000000001px;
      };

      --layout-flex-2: {
        -ms-flex: 2;
        -webkit-flex: 2;
        flex: 2;
      };

      --layout-flex-3: {
        -ms-flex: 3;
        -webkit-flex: 3;
        flex: 3;
      };

      --layout-flex-4: {
        -ms-flex: 4;
        -webkit-flex: 4;
        flex: 4;
      };

      --layout-flex-5: {
        -ms-flex: 5;
        -webkit-flex: 5;
        flex: 5;
      };

      --layout-flex-6: {
        -ms-flex: 6;
        -webkit-flex: 6;
        flex: 6;
      };

      --layout-flex-7: {
        -ms-flex: 7;
        -webkit-flex: 7;
        flex: 7;
      };

      --layout-flex-8: {
        -ms-flex: 8;
        -webkit-flex: 8;
        flex: 8;
      };

      --layout-flex-9: {
        -ms-flex: 9;
        -webkit-flex: 9;
        flex: 9;
      };

      --layout-flex-10: {
        -ms-flex: 10;
        -webkit-flex: 10;
        flex: 10;
      };

      --layout-flex-11: {
        -ms-flex: 11;
        -webkit-flex: 11;
        flex: 11;
      };

      --layout-flex-12: {
        -ms-flex: 12;
        -webkit-flex: 12;
        flex: 12;
      };

      /* alignment in cross axis */

      --layout-start: {
        -ms-flex-align: start;
        -webkit-align-items: flex-start;
        align-items: flex-start;
      };

      --layout-center: {
        -ms-flex-align: center;
        -webkit-align-items: center;
        align-items: center;
      };

      --layout-end: {
        -ms-flex-align: end;
        -webkit-align-items: flex-end;
        align-items: flex-end;
      };

      --layout-baseline: {
        -ms-flex-align: baseline;
        -webkit-align-items: baseline;
        align-items: baseline;
      };

      /* alignment in main axis */

      --layout-start-justified: {
        -ms-flex-pack: start;
        -webkit-justify-content: flex-start;
        justify-content: flex-start;
      };

      --layout-center-justified: {
        -ms-flex-pack: center;
        -webkit-justify-content: center;
        justify-content: center;
      };

      --layout-end-justified: {
        -ms-flex-pack: end;
        -webkit-justify-content: flex-end;
        justify-content: flex-end;
      };

      --layout-around-justified: {
        -ms-flex-pack: distribute;
        -webkit-justify-content: space-around;
        justify-content: space-around;
      };

      --layout-justified: {
        -ms-flex-pack: justify;
        -webkit-justify-content: space-between;
        justify-content: space-between;
      };

      --layout-center-center: {
        @apply --layout-center;
        @apply --layout-center-justified;
      };

      /* self alignment */

      --layout-self-start: {
        -ms-align-self: flex-start;
        -webkit-align-self: flex-start;
        align-self: flex-start;
      };

      --layout-self-center: {
        -ms-align-self: center;
        -webkit-align-self: center;
        align-self: center;
      };

      --layout-self-end: {
        -ms-align-self: flex-end;
        -webkit-align-self: flex-end;
        align-self: flex-end;
      };

      --layout-self-stretch: {
        -ms-align-self: stretch;
        -webkit-align-self: stretch;
        align-self: stretch;
      };

      --layout-self-baseline: {
        -ms-align-self: baseline;
        -webkit-align-self: baseline;
        align-self: baseline;
      };

      /* multi-line alignment in main axis */

      --layout-start-aligned: {
        -ms-flex-line-pack: start;  /* IE10 */
        -ms-align-content: flex-start;
        -webkit-align-content: flex-start;
        align-content: flex-start;
      };

      --layout-end-aligned: {
        -ms-flex-line-pack: end;  /* IE10 */
        -ms-align-content: flex-end;
        -webkit-align-content: flex-end;
        align-content: flex-end;
      };

      --layout-center-aligned: {
        -ms-flex-line-pack: center;  /* IE10 */
        -ms-align-content: center;
        -webkit-align-content: center;
        align-content: center;
      };

      --layout-between-aligned: {
        -ms-flex-line-pack: justify;  /* IE10 */
        -ms-align-content: space-between;
        -webkit-align-content: space-between;
        align-content: space-between;
      };

      --layout-around-aligned: {
        -ms-flex-line-pack: distribute;  /* IE10 */
        -ms-align-content: space-around;
        -webkit-align-content: space-around;
        align-content: space-around;
      };

      /*******************************
                Other Layout
      *******************************/

      --layout-block: {
        display: block;
      };

      --layout-invisible: {
        visibility: hidden !important;
      };

      --layout-relative: {
        position: relative;
      };

      --layout-fit: {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      };

      --layout-scroll: {
        -webkit-overflow-scrolling: touch;
        overflow: auto;
      };

      --layout-fullbleed: {
        margin: 0;
        height: 100vh;
      };

      /* fixed position */

      --layout-fixed-top: {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
      };

      --layout-fixed-right: {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
      };

      --layout-fixed-bottom: {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
      };

      --layout-fixed-left: {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
      };

    }
  </style>
</custom-style>`;

    template.setAttribute('style', 'display: none;');
    document.head.appendChild(template.content);

    var style = document.createElement('style');
    style.textContent = '[hidden] { display: none !important; }';
    document.head.appendChild(style);

    /**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    */

    class IronMeta {
      /**
       * @param {{
       *   type: (string|null|undefined),
       *   key: (string|null|undefined),
       *   value: *,
       * }=} options
       */
      constructor(options) {
        IronMeta[' '](options);

        /** @type {string} */
        this.type = (options && options.type) || 'default';
        /** @type {string|null|undefined} */
        this.key = options && options.key;
        if (options && 'value' in options) {
          /** @type {*} */
          this.value = options.value;
        }
      }

      /** @return {*} */
      get value() {
        var type = this.type;
        var key = this.key;

        if (type && key) {
          return IronMeta.types[type] && IronMeta.types[type][key];
        }
      }

      /** @param {*} value */
      set value(value) {
        var type = this.type;
        var key = this.key;

        if (type && key) {
          type = IronMeta.types[type] = IronMeta.types[type] || {};
          if (value == null) {
            delete type[key];
          } else {
            type[key] = value;
          }
        }
      }

      /** @return {!Array<*>} */
      get list() {
        var type = this.type;

        if (type) {
          var items = IronMeta.types[this.type];
          if (!items) {
            return [];
          }

          return Object.keys(items).map(function(key) {
            return metaDatas[this.type][key];
          }, this);
        }
      }

      /**
       * @param {string} key
       * @return {*}
       */
      byKey(key) {
        this.key = key;
        return this.value;
      }
    }
    // This function is used to convince Closure not to remove constructor calls
    // for instances that are not held anywhere. For example, when
    // `new IronMeta({...})` is used only for the side effect of adding a value.
    IronMeta[' '] = function() {};

    IronMeta.types = {};

    var metaDatas = IronMeta.types;

    /**
    `iron-meta` is a generic element you can use for sharing information across the
    DOM tree. It uses [monostate pattern](http://c2.com/cgi/wiki?MonostatePattern)
    such that any instance of iron-meta has access to the shared information. You
    can use `iron-meta` to share whatever you want (or create an extension [like
    x-meta] for enhancements).

    The `iron-meta` instances containing your actual data can be loaded in an
    import, or constructed in any way you see fit. The only requirement is that you
    create them before you try to access them.

    Examples:

    If I create an instance like this:

        <iron-meta key="info" value="foo/bar"></iron-meta>

    Note that value="foo/bar" is the metadata I've defined. I could define more
    attributes or use child nodes to define additional metadata.

    Now I can access that element (and it's metadata) from any iron-meta instance
    via the byKey method, e.g.

        meta.byKey('info');

    Pure imperative form would be like:

        document.createElement('iron-meta').byKey('info');

    Or, in a Polymer element, you can include a meta in your template:

        <iron-meta id="meta"></iron-meta>
        ...
        this.$.meta.byKey('info');

    @group Iron Elements
    @demo demo/index.html
    @element iron-meta
    */
    Polymer({

      is: 'iron-meta',

      properties: {

        /**
         * The type of meta-data.  All meta-data of the same type is stored
         * together.
         * @type {string}
         */
        type: {
          type: String,
          value: 'default',
        },

        /**
         * The key used to store `value` under the `type` namespace.
         * @type {?string}
         */
        key: {
          type: String,
        },

        /**
         * The meta-data to store or retrieve.
         * @type {*}
         */
        value: {
          type: String,
          notify: true,
        },

        /**
         * If true, `value` is set to the iron-meta instance itself.
         */
        self: {type: Boolean, observer: '_selfChanged'},

        __meta: {type: Boolean, computed: '__computeMeta(type, key, value)'}
      },

      hostAttributes: {hidden: true},

      __computeMeta: function(type, key, value) {
        var meta = new IronMeta({type: type, key: key});

        if (value !== undefined && value !== meta.value) {
          meta.value = value;
        } else if (this.value !== meta.value) {
          this.value = meta.value;
        }

        return meta;
      },

      get list() {
        return this.__meta && this.__meta.list;
      },

      _selfChanged: function(self) {
        if (self) {
          this.value = this;
        }
      },

      /**
       * Retrieves meta data value by key.
       *
       * @method byKey
       * @param {string} key The key of the meta-data to be returned.
       * @return {*}
       */
      byKey: function(key) {
        return new IronMeta({type: this.type, key: key}).value;
      }
    });

    /**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    */

    /**

    The `iron-icon` element displays an icon. By default an icon renders as a 24px
    square.

    Example using src:

        <iron-icon src="star.png"></iron-icon>

    Example setting size to 32px x 32px:

        <iron-icon class="big" src="big_star.png"></iron-icon>

        <style is="custom-style">
          .big {
            --iron-icon-height: 32px;
            --iron-icon-width: 32px;
          }
        </style>

    The iron elements include several sets of icons. To use the default set of
    icons, import `iron-icons.js` and use the `icon` attribute to specify an icon:

        <script type="module">
          import "@polymer/iron-icons/iron-icons.js";
        </script>

        <iron-icon icon="menu"></iron-icon>

    To use a different built-in set of icons, import the specific
    `iron-icons/<iconset>-icons.js`, and specify the icon as `<iconset>:<icon>`.
    For example, to use a communication icon, you would use:

        <script type="module">
          import "@polymer/iron-icons/communication-icons.js";
        </script>

        <iron-icon icon="communication:email"></iron-icon>

    You can also create custom icon sets of bitmap or SVG icons.

    Example of using an icon named `cherry` from a custom iconset with the ID
    `fruit`:

        <iron-icon icon="fruit:cherry"></iron-icon>

    See `<iron-iconset>` and `<iron-iconset-svg>` for more information about how to
    create a custom iconset.

    See the `iron-icons` demo to see the icons available in the various iconsets.

    ### Styling

    The following custom properties are available for styling:

    Custom property | Description | Default
    ----------------|-------------|----------
    `--iron-icon` | Mixin applied to the icon | {}
    `--iron-icon-width` | Width of the icon | `24px`
    `--iron-icon-height` | Height of the icon | `24px`
    `--iron-icon-fill-color` | Fill color of the svg icon | `currentcolor`
    `--iron-icon-stroke-color` | Stroke color of the svg icon | none

    @group Iron Elements
    @element iron-icon
    @demo demo/index.html
    @hero hero.svg
    @homepage polymer.github.io
    */
    Polymer({
      _template: html$1`
    <style>
      :host {
        @apply --layout-inline;
        @apply --layout-center-center;
        position: relative;

        vertical-align: middle;

        fill: var(--iron-icon-fill-color, currentcolor);
        stroke: var(--iron-icon-stroke-color, none);

        width: var(--iron-icon-width, 24px);
        height: var(--iron-icon-height, 24px);
        @apply --iron-icon;
      }

      :host([hidden]) {
        display: none;
      }
    </style>
`,

      is: 'iron-icon',

      properties: {

        /**
         * The name of the icon to use. The name should be of the form:
         * `iconset_name:icon_name`.
         */
        icon: {type: String},

        /**
         * The name of the theme to used, if one is specified by the
         * iconset.
         */
        theme: {type: String},

        /**
         * If using iron-icon without an iconset, you can set the src to be
         * the URL of an individual icon image file. Note that this will take
         * precedence over a given icon attribute.
         */
        src: {type: String},

        /**
         * @type {!IronMeta}
         */
        _meta: {value: Base.create('iron-meta', {type: 'iconset'})}

      },

      observers: [
        '_updateIcon(_meta, isAttached)',
        '_updateIcon(theme, isAttached)',
        '_srcChanged(src, isAttached)',
        '_iconChanged(icon, isAttached)'
      ],

      _DEFAULT_ICONSET: 'icons',

      _iconChanged: function(icon) {
        var parts = (icon || '').split(':');
        this._iconName = parts.pop();
        this._iconsetName = parts.pop() || this._DEFAULT_ICONSET;
        this._updateIcon();
      },

      _srcChanged: function(src) {
        this._updateIcon();
      },

      _usesIconset: function() {
        return this.icon || !this.src;
      },

      /** @suppress {visibility} */
      _updateIcon: function() {
        if (this._usesIconset()) {
          if (this._img && this._img.parentNode) {
            dom(this.root).removeChild(this._img);
          }
          if (this._iconName === '') {
            if (this._iconset) {
              this._iconset.removeIcon(this);
            }
          } else if (this._iconsetName && this._meta) {
            this._iconset = /** @type {?Polymer.Iconset} */ (
                this._meta.byKey(this._iconsetName));
            if (this._iconset) {
              this._iconset.applyIcon(this, this._iconName, this.theme);
              this.unlisten(window, 'iron-iconset-added', '_updateIcon');
            } else {
              this.listen(window, 'iron-iconset-added', '_updateIcon');
            }
          }
        } else {
          if (this._iconset) {
            this._iconset.removeIcon(this);
          }
          if (!this._img) {
            this._img = document.createElement('img');
            this._img.style.width = '100%';
            this._img.style.height = '100%';
            this._img.draggable = false;
          }
          this._img.src = this.src;
          dom(this.root).appendChild(this._img);
        }
      }
    });

    /**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    */
    /**
     * The `iron-iconset-svg` element allows users to define their own icon sets
     * that contain svg icons. The svg icon elements should be children of the
     * `iron-iconset-svg` element. Multiple icons should be given distinct id's.
     *
     * Using svg elements to create icons has a few advantages over traditional
     * bitmap graphics like jpg or png. Icons that use svg are vector based so
     * they are resolution independent and should look good on any device. They
     * are stylable via css. Icons can be themed, colorized, and even animated.
     *
     * Example:
     *
     *     <iron-iconset-svg name="my-svg-icons" size="24">
     *       <svg>
     *         <defs>
     *           <g id="shape">
     *             <rect x="12" y="0" width="12" height="24" />
     *             <circle cx="12" cy="12" r="12" />
     *           </g>
     *         </defs>
     *       </svg>
     *     </iron-iconset-svg>
     *
     * This will automatically register the icon set "my-svg-icons" to the iconset
     * database.  To use these icons from within another element, make a
     * `iron-iconset` element and call the `byId` method
     * to retrieve a given iconset. To apply a particular icon inside an
     * element use the `applyIcon` method. For example:
     *
     *     iconset.applyIcon(iconNode, 'car');
     *
     * @element iron-iconset-svg
     * @demo demo/index.html
     * @implements {Polymer.Iconset}
     */
    Polymer({
      is: 'iron-iconset-svg',

      properties: {

        /**
         * The name of the iconset.
         */
        name: {type: String, observer: '_nameChanged'},

        /**
         * The size of an individual icon. Note that icons must be square.
         */
        size: {type: Number, value: 24},

        /**
         * Set to true to enable mirroring of icons where specified when they are
         * stamped. Icons that should be mirrored should be decorated with a
         * `mirror-in-rtl` attribute.
         *
         * NOTE: For performance reasons, direction will be resolved once per
         * document per iconset, so moving icons in and out of RTL subtrees will
         * not cause their mirrored state to change.
         */
        rtlMirroring: {type: Boolean, value: false},

        /**
         * Set to true to measure RTL based on the dir attribute on the body or
         * html elements (measured on document.body or document.documentElement as
         * available).
         */
        useGlobalRtlAttribute: {type: Boolean, value: false}
      },

      created: function() {
        this._meta = new IronMeta({type: 'iconset', key: null, value: null});
      },

      attached: function() {
        this.style.display = 'none';
      },

      /**
       * Construct an array of all icon names in this iconset.
       *
       * @return {!Array} Array of icon names.
       */
      getIconNames: function() {
        this._icons = this._createIconMap();
        return Object.keys(this._icons).map(function(n) {
          return this.name + ':' + n;
        }, this);
      },

      /**
       * Applies an icon to the given element.
       *
       * An svg icon is prepended to the element's shadowRoot if it exists,
       * otherwise to the element itself.
       *
       * If RTL mirroring is enabled, and the icon is marked to be mirrored in
       * RTL, the element will be tested (once and only once ever for each
       * iconset) to determine the direction of the subtree the element is in.
       * This direction will apply to all future icon applications, although only
       * icons marked to be mirrored will be affected.
       *
       * @method applyIcon
       * @param {Element} element Element to which the icon is applied.
       * @param {string} iconName Name of the icon to apply.
       * @return {?Element} The svg element which renders the icon.
       */
      applyIcon: function(element, iconName) {
        // Remove old svg element
        this.removeIcon(element);
        // install new svg element
        var svg = this._cloneIcon(
            iconName, this.rtlMirroring && this._targetIsRTL(element));
        if (svg) {
          // insert svg element into shadow root, if it exists
          var pde = dom(element.root || element);
          pde.insertBefore(svg, pde.childNodes[0]);
          return element._svgIcon = svg;
        }
        return null;
      },

      /**
       * Remove an icon from the given element by undoing the changes effected
       * by `applyIcon`.
       *
       * @param {Element} element The element from which the icon is removed.
       */
      removeIcon: function(element) {
        // Remove old svg element
        if (element._svgIcon) {
          dom(element.root || element).removeChild(element._svgIcon);
          element._svgIcon = null;
        }
      },

      /**
       * Measures and memoizes the direction of the element. Note that this
       * measurement is only done once and the result is memoized for future
       * invocations.
       */
      _targetIsRTL: function(target) {
        if (this.__targetIsRTL == null) {
          if (this.useGlobalRtlAttribute) {
            var globalElement =
                (document.body && document.body.hasAttribute('dir')) ?
                document.body :
                document.documentElement;

            this.__targetIsRTL = globalElement.getAttribute('dir') === 'rtl';
          } else {
            if (target && target.nodeType !== Node.ELEMENT_NODE) {
              target = target.host;
            }

            this.__targetIsRTL =
                target && window.getComputedStyle(target)['direction'] === 'rtl';
          }
        }

        return this.__targetIsRTL;
      },

      /**
       *
       * When name is changed, register iconset metadata
       *
       */
      _nameChanged: function() {
        this._meta.value = null;
        this._meta.key = this.name;
        this._meta.value = this;

        this.async(function() {
          this.fire('iron-iconset-added', this, {node: window});
        });
      },

      /**
       * Create a map of child SVG elements by id.
       *
       * @return {!Object} Map of id's to SVG elements.
       */
      _createIconMap: function() {
        // Objects chained to Object.prototype (`{}`) have members. Specifically,
        // on FF there is a `watch` method that confuses the icon map, so we
        // need to use a null-based object here.
        var icons = Object.create(null);
        dom(this).querySelectorAll('[id]').forEach(function(icon) {
          icons[icon.id] = icon;
        });
        return icons;
      },

      /**
       * Produce installable clone of the SVG element matching `id` in this
       * iconset, or `undefined` if there is no matching element.
       *
       * @return {Element} Returns an installable clone of the SVG element
       * matching `id`.
       */
      _cloneIcon: function(id, mirrorAllowed) {
        // create the icon map on-demand, since the iconset itself has no discrete
        // signal to know when it's children are fully parsed
        this._icons = this._icons || this._createIconMap();
        return this._prepareSvgClone(this._icons[id], this.size, mirrorAllowed);
      },

      /**
       * @param {Element} sourceSvg
       * @param {number} size
       * @param {Boolean} mirrorAllowed
       * @return {Element}
       */
      _prepareSvgClone: function(sourceSvg, size, mirrorAllowed) {
        if (sourceSvg) {
          var content = sourceSvg.cloneNode(true),
              svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
              viewBox =
                  content.getAttribute('viewBox') || '0 0 ' + size + ' ' + size,
              cssText =
                  'pointer-events: none; display: block; width: 100%; height: 100%;';

          if (mirrorAllowed && content.hasAttribute('mirror-in-rtl')) {
            cssText +=
                '-webkit-transform:scale(-1,1);transform:scale(-1,1);transform-origin:center;';
          }

          svg.setAttribute('viewBox', viewBox);
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.setAttribute('focusable', 'false');
          // TODO(dfreedm): `pointer-events: none` works around
          // https://crbug.com/370136
          // TODO(sjmiles): inline style may not be ideal, but avoids requiring a
          // shadow-root
          svg.style.cssText = cssText;
          svg.appendChild(content).removeAttribute('id');
          return svg;
        }
        return null;
      }

    });

    const $_documentContainer$2 = document.createElement('template');

    $_documentContainer$2.innerHTML = `<iron-iconset-svg size="333 85" name="parmaco-set">
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
<g id="logo">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 85H333V0H0V85Z" fill="#005F9A"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M168.192 4.99316C164.994 4.99316 163.395 7.81196 163.395 13.449C163.395 19.0991 164.994 21.9242 168.192 21.9242C171.287 21.9242 172.835 19.1054 172.835 13.4683C172.835 7.81822 171.287 4.99316 168.192 4.99316ZM176.365 23.0154C174.46 25.617 171.678 26.9176 168.02 26.9176C164.514 26.9176 161.802 25.5977 159.884 22.958C157.966 20.3176 157.007 17.1225 157.007 13.3727C157.007 9.55914 157.978 6.37768 159.922 3.82604C161.866 1.27554 164.635 0 168.23 0C171.863 0 174.603 1.36137 176.452 4.08411C178.299 6.80798 179.224 9.92293 179.224 13.4307C179.224 17.2186 178.271 20.4137 176.365 23.0154ZM143.073 4.99358C139.888 4.99358 138.296 7.8317 138.296 13.5068C138.296 16.7849 138.729 19.0069 139.595 20.1744C140.461 21.3408 141.671 21.9246 143.226 21.9246C145.748 21.9246 147.289 20.2796 147.85 16.9884L153.761 17.3522C153.38 20.4774 152.22 22.8522 150.281 24.4785C148.342 26.1053 145.968 26.9176 143.159 26.9176C139.713 26.9176 136.913 25.7256 134.758 23.3405C132.603 20.9554 131.526 17.6586 131.526 13.4494C131.526 9.50798 132.568 6.28162 134.653 3.76863C136.738 1.25621 139.586 0 143.197 0C149.452 0 152.973 3.37415 153.761 10.1207L147.373 10.5226C147.283 6.8364 145.85 4.99358 143.073 4.99358ZM117.515 7.15527L114.733 16.3188H120.249L117.515 7.15527ZM123.291 26.5167L121.686 21.1406H113.27L111.639 26.5167H106.292L114.635 0.402344H121.696L129.844 26.5167H123.291ZM96.6013 26.5167V5.22369L90.0531 26.5167H85.8796L79.4566 5.22369V26.5167H74.3459V0.402344H83.8415L88.4106 16.0328L93.217 0.402344H102.741V26.5167H96.6013ZM61.7183 6.31381C61.286 5.73971 60.8157 5.38615 60.3069 5.252C59.7987 5.11786 58.8445 5.05078 57.4462 5.05078H53.842V11.7093H57.5799C58.8009 11.7093 59.687 11.6229 60.2406 11.4501C60.793 11.2778 61.286 10.8959 61.7183 10.303C62.15 9.70956 62.367 9.0303 62.367 8.2652C62.367 7.53819 62.15 6.88792 61.7183 6.31381ZM64.1399 14.971L68.9457 26.5167H62.2078L58.2104 16.1669H53.842V26.5167H47.7018V0.402344H59.1436C61.2542 0.402344 62.9478 0.647333 64.226 1.13845C65.5037 1.62956 66.5621 2.53108 67.4012 3.84356C68.2403 5.15662 68.6602 6.61632 68.6602 8.22211C68.6602 11.357 67.153 13.6073 64.1399 14.971ZM31.5933 7.15527L28.8108 16.3188H34.3272L31.5933 7.15527ZM37.368 26.5167L35.7646 21.1406H27.3489L25.7166 26.5167H20.3707L28.7139 0.402344H35.7736L43.9219 26.5167H37.368ZM13.034 6.0834C12.3535 5.45871 11.3212 5.14551 9.93584 5.14551H5.98779V12.0711H9.95453C11.4673 12.0711 12.5291 11.7204 13.1394 11.019C13.7496 10.3181 14.0544 9.51439 14.0544 8.6089C14.0544 7.5505 13.7139 6.70867 13.034 6.0834ZM19.4326 12.1874C18.9237 13.4118 18.2047 14.3747 17.2778 15.0756C16.3491 15.7781 15.4494 16.2431 14.5791 16.4727C13.7082 16.7024 12.3444 16.8172 10.4883 16.8172H6.19743V26.5167H0V0.402344H10.2594C12.5478 0.402344 14.2992 0.647902 15.5134 1.13902C16.7271 1.63013 17.811 2.50664 18.7651 3.7691C19.7181 5.03213 20.1946 6.58165 20.1946 8.41822C20.1946 9.70683 19.9408 10.963 19.4326 12.1874Z" transform="translate(120.857 28.6016)" fill="#FFFFFE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M58.1634 11.6981C58.9271 12.3859 59.3102 13.2033 59.3102 14.1514L59.2971 28.5654H38.4175L27.6777 39.2313L79.0804 39.2364V6.89779C79.0804 5.04985 78.3155 3.43838 76.7868 2.06223C75.257 0.687789 73.4654 0 71.4098 0H0V53.427H19.7702V10.667H55.4352C56.4891 10.667 57.3985 11.0115 58.1634 11.6981Z" transform="translate(33 16)" fill="#FFFFFE"/>
</g>
<g id="logo-crop">
<path fill-rule="evenodd" clip-rule="evenodd" d="M168.192 4.99316C164.994 4.99316 163.395 7.81196 163.395 13.449C163.395 19.0991 164.994 21.9242 168.192 21.9242C171.287 21.9242 172.835 19.1054 172.835 13.4683C172.835 7.81822 171.287 4.99316 168.192 4.99316ZM176.365 23.0154C174.46 25.617 171.678 26.9176 168.019 26.9176C164.514 26.9176 161.802 25.5977 159.884 22.958C157.966 20.3176 157.007 17.1225 157.007 13.3727C157.007 9.55914 157.978 6.37768 159.922 3.82604C161.866 1.27554 164.635 0 168.23 0C171.863 0 174.603 1.36137 176.452 4.08411C178.299 6.80798 179.224 9.92293 179.224 13.4307C179.224 17.2186 178.271 20.4137 176.365 23.0154ZM143.073 4.99358C139.888 4.99358 138.296 7.8317 138.296 13.5068C138.296 16.7849 138.729 19.0069 139.595 20.1744C140.461 21.3408 141.671 21.9246 143.226 21.9246C145.748 21.9246 147.289 20.2796 147.85 16.9884L153.761 17.3522C153.38 20.4774 152.22 22.8522 150.281 24.4785C148.342 26.1053 145.968 26.9176 143.159 26.9176C139.713 26.9176 136.913 25.7256 134.758 23.3405C132.603 20.9554 131.526 17.6586 131.526 13.4494C131.526 9.50798 132.568 6.28162 134.653 3.76863C136.738 1.25621 139.586 0 143.197 0C149.452 0 152.973 3.37415 153.761 10.1207L147.373 10.5226C147.283 6.8364 145.85 4.99358 143.073 4.99358ZM117.515 7.15527L114.733 16.3188H120.249L117.515 7.15527ZM123.291 26.5167L121.686 21.1406H113.27L111.639 26.5167H106.292L114.635 0.402344H121.696L129.844 26.5167H123.291ZM96.6013 26.5167V5.22369L90.0531 26.5167H85.8796L79.4566 5.22369V26.5167H74.3459V0.402344H83.8415L88.4106 16.0328L93.217 0.402344H102.741V26.5167H96.6013ZM61.7183 6.31381C61.286 5.73971 60.8157 5.38615 60.3069 5.252C59.7987 5.11786 58.8445 5.05078 57.4462 5.05078H53.842V11.7093H57.5799C58.8009 11.7093 59.687 11.6229 60.2406 11.4501C60.793 11.2778 61.286 10.8959 61.7183 10.303C62.15 9.70956 62.367 9.0303 62.367 8.2652C62.367 7.53819 62.15 6.88792 61.7183 6.31381ZM64.1397 14.971L68.9456 26.5167H62.2077L58.2103 16.1669H53.8419V26.5167H47.7017V0.402344H59.1435C61.2541 0.402344 62.9476 0.647333 64.2259 1.13845C65.5035 1.62956 66.5619 2.53108 67.4011 3.84356C68.2402 5.15662 68.66 6.61632 68.66 8.22211C68.66 11.357 67.1529 13.6073 64.1397 14.971ZM31.5933 7.15527L28.8108 16.3188H34.3272L31.5933 7.15527ZM37.3679 26.5167L35.7645 21.1406H27.3488L25.7164 26.5167H20.3706L28.7137 0.402344H35.7735L43.9217 26.5167H37.3679ZM13.034 6.0834C12.3535 5.45871 11.3212 5.14551 9.93584 5.14551H5.98779V12.0711H9.95453C11.4673 12.0711 12.5291 11.7204 13.1394 11.019C13.7496 10.3181 14.0544 9.51439 14.0544 8.6089C14.0544 7.5505 13.7139 6.70867 13.034 6.0834ZM19.4326 12.1874C18.9237 13.4118 18.2047 14.3747 17.2778 15.0756C16.3491 15.7781 15.4494 16.2431 14.5791 16.4727C13.7082 16.7024 12.3444 16.8172 10.4883 16.8172H6.19743V26.5167H0V0.402344H10.2594C12.5478 0.402344 14.2992 0.647902 15.5134 1.13902C16.7271 1.63013 17.811 2.50664 18.7651 3.7691C19.7181 5.03213 20.1946 6.58165 20.1946 8.41822C20.1946 9.70683 19.9408 10.963 19.4326 12.1874Z" transform="translate(87.8569 28.6016)" fill="#FFFFFE"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M58.1634 11.6981C58.9271 12.3859 59.3102 13.2033 59.3102 14.1514L59.2971 28.5654H38.4175L27.6777 39.2313L79.0804 39.2364V6.89779C79.0804 5.04985 78.3155 3.43838 76.7868 2.06223C75.257 0.687789 73.4654 0 71.4098 0H0V53.427H19.7702V10.667H55.4352C56.4891 10.667 57.3985 11.0115 58.1634 11.6981Z" transform="translate(0 16)" fill="#FFFFFE"/>
</g>
</defs>
</svg>
</iron-iconset-svg>`;

    document.head.appendChild($_documentContainer$2.content);

    const $_documentContainer$3 = document.createElement('template');

    $_documentContainer$3.innerHTML = `<custom-style>
  <style>
    :root {
      --parmaco-size-xs: 1.625rem;
      --parmaco-size-s: 1.875rem;
      --parmaco-size-m: 2.25rem;
      --parmaco-size-l: 2.75rem;
      --parmaco-size-xl: 3.5rem;

      /* Icons */
      --parmaco-icon-size-s: 1.25em;
      --parmaco-icon-size-m: 1.5em;
      --parmaco-icon-size-l: 2.25em;
      /* For backwards compatibility */
      --parmaco-icon-size: var(--parmaco-icon-size-m);
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$3.content);

    const $_documentContainer$4 = document.createElement('template');

    $_documentContainer$4.innerHTML = `<custom-style>
  <style>
    html {
      /* Square */
      --parmaco-space-xs: 0.25rem;
      --parmaco-space-s: 0.5rem;
      --parmaco-space-m: 1rem;
      --parmaco-space-l: 1.5rem;
      --parmaco-space-xl: 2.5rem;

      /* Wide */
      --parmaco-space-wide-xs: calc(var(--parmaco-space-xs) / 2) var(--parmaco-space-xs);
      --parmaco-space-wide-s: calc(var(--parmaco-space-s) / 2) var(--parmaco-space-s);
      --parmaco-space-wide-m: calc(var(--parmaco-space-m) / 2) var(--parmaco-space-m);
      --parmaco-space-wide-l: calc(var(--parmaco-space-l) / 2) var(--parmaco-space-l);
      --parmaco-space-wide-xl: calc(var(--parmaco-space-xl) / 2) var(--parmaco-space-xl);

      /* Tall */
      --parmaco-space-tall-xs: var(--parmaco-space-xs) calc(var(--parmaco-space-xs) / 2);
      --parmaco-space-tall-s: var(--parmaco-space-s) calc(var(--parmaco-space-s) / 2);
      --parmaco-space-tall-m: var(--parmaco-space-m) calc(var(--parmaco-space-m) / 2);
      --parmaco-space-tall-l: var(--parmaco-space-l) calc(var(--parmaco-space-l) / 2);
      --parmaco-space-tall-xl: var(--parmaco-space-xl) calc(var(--parmaco-space-xl) / 2);
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$4.content);

    const $_documentContainer$5 = document.createElement('template');

    $_documentContainer$5.innerHTML = `<custom-style>
  <style>
    html {
      --lumo-border-radius: 0.25em;

      /* Shadows */
      --lumo-box-shadow-s: 0 1px 2px 0 var(--lumo-shade-20pct), 0 2px 8px -2px var(--lumo-shade-40pct);
      --lumo-box-shadow-m: 0 2px 6px -1px var(--lumo-shade-20pct), 0 8px 24px -4px var(--lumo-shade-40pct);
      --lumo-box-shadow-l: 0 3px 18px -2px var(--lumo-shade-20pct), 0 12px 48px -6px var(--lumo-shade-40pct);
      --lumo-box-shadow-xl: 0 4px 24px -3px var(--lumo-shade-20pct), 0 18px 64px -8px var(--lumo-shade-40pct);
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$5.content);

    const $_documentContainer$6 = document.createElement('template');

    $_documentContainer$6.innerHTML = `<custom-style>
  <style>
    html {
        
      /* SHADOWS */
      --whcg-box-shadow-xs: 0px 0px 0px var(--whcg-shade-40pct), 0px 0px 0px var(--whcg-shade-20pct);
      --whcg-box-shadow-s: 0px 2px 8px var(--whcg-shade-40pct), 0px 1px 2px var(--whcg-shade-20pct);
      --whcg-box-shadow-m: 0px 8px 24px var(--whcg-shade-40pct), 0px 2px 6px var(--whcg-shade-20pct);
      --whcg-box-shadow-l: 0px 12px 48px var(--whcg-shade-40pct), 0px 3px 18px var(--whcg-shade-20pct);
      --whcg-box-shadow-xl: 0px 18px 64px var(--whcg-shade-40pct), 0px 4px 24px var(--whcg-shade-20pct);
      
      /* BORDERS */
      --parmaco-border-radius: 0.25em;
      --parmaco-border-style: solid;
      --parmaco-border-width: 1px;

      /* DIVIDERS */
      --parmaco-divider-left: -1px 0 0 0 var(--parmaco-black-color-10pct);

     
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$6.content);

    const $_documentContainer$7 = document.createElement('template');

    $_documentContainer$7.innerHTML = `<custom-style>
  <style>
    :root {

      /* Font families */
      --parmaco-font-family: "Exo 2", -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

      /* Font sizes */
      --parmaco-font-size-xxs: .75rem;
      --parmaco-font-size-xs: .8125rem;
      --parmaco-font-size-s: .875rem;
      --parmaco-font-size-m: 1rem;
      --parmaco-font-size-l: 1.125rem;
      --parmaco-font-size-xl: 1.375rem;
      --parmaco-font-size-xxl: 1.75rem;
      --parmaco-font-size-xxxl: 2.5rem;
      --parmaco-font-size-xxxxl: 3.25rem;

      /* Line heights */
      --parmaco-line-height-none: 1;
      --parmaco-line-height-xs: 1.25;
      --parmaco-line-height-s: 1.375;
      --parmaco-line-height-m: 1.625;

      /* Font weights */
      --parmaco-font-weight-thin: 100;
      --parmaco-font-weight-extralight: 200;
      --parmaco-font-weight-light: 300;
      --parmaco-font-weight-normal: 400;
      --parmaco-font-weight-medium: 500;
      --parmaco-font-weight-semibold: 600;
      --parmaco-font-weight-bold: 700;
      --parmaco-font-weight-extrabold: 800;
      --parmaco-font-weight-black: 900;

      /* Heading */
      --h1-font-weight: 600;
      --h1-line-height: var(--parmaco-line-height-xs);
      --h1-margin-top: 1.25em;
      --h1-font-size: var(--parmaco-font-size-xxxl);
      --h1-margin-bottom: 0.75em;

      --h2-font-weight: 600;
      --h2-line-height: var(--parmaco-line-height-xs);
      --h2-margin-top: 1.25em;
      --h2-font-size: var(--parmaco-font-size-xxl);
      --h2-margin-bottom: 0.5em;

      --h3-font-weight: 600;
      --h3-line-height: var(--parmaco-line-height-xs);
      --h3-margin-top: 1.25em;
      --h3-font-size: var(--parmaco-font-size-xl);
      --h3-margin-bottom: 0.5em;

      --h4-font-weight: 600;
      --h4-line-height: var(--parmaco-line-height-xs);
      --h4-margin-top: 1.25em;
      --h4-font-size: var(--parmaco-font-size-l);
      --h4-margin-bottom: 0.5em;

      --h5-font-weight: 600;
      --h5-line-height: var(--parmaco-line-height-xs);
      --h5-margin-top: 1.25em;
      --h5-font-size: var(--parmaco-font-size-m);
      --h5-margin-bottom: 0.25em;

      --h6-font-weight: 600;
      --h6-line-height: var(--parmaco-line-height-xs);
      --h6-margin-top: 1.25em;
      --h6-font-size: var(--parmaco-font-size-xs);
      --h6-margin-bottom: 0;
      --h6-text-transform: uppercase;
      --h6-letter-spacing: 0.03em;
    }

  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$7.content);



    // <dom-module id="lumo-typography">
    //   <template>
    //     <style>
    //       html {
    //         font-family: var(--lumo-font-family);
    //         font-size: var(--lumo-font-size, var(--lumo-font-size-m));
    //         line-height: var(--lumo-line-height-m);
    //         -webkit-text-size-adjust: 100%;
    //         -webkit-font-smoothing: antialiased;
    //         -moz-osx-font-smoothing: grayscale;
    //       }

    //       /* Can’t combine with the above selector because that doesn’t work in browsers without native shadow dom */
    //       :host {
    //         font-family: var(--lumo-font-family);
    //         font-size: var(--lumo-font-size, var(--lumo-font-size-m));
    //         line-height: var(--lumo-line-height-m);
    //         -webkit-text-size-adjust: 100%;
    //         -webkit-font-smoothing: antialiased;
    //         -moz-osx-font-smoothing: grayscale;
    //       }

    //       small,
    //       [theme~="font-size-s"] {
    //         font-size: var(--lumo-font-size-s);
    //         line-height: var(--lumo-line-height-s);
    //       }

    //       [theme~="font-size-xs"] {
    //         font-size: var(--lumo-font-size-xs);
    //         line-height: var(--lumo-line-height-xs);
    //       }



    //       p {
    //         margin-top: 0.5em;
    //         margin-bottom: 0.75em;
    //       }

    //       a {
    //         text-decoration: none;
    //       }

    //       a:hover {
    //         text-decoration: underline;
    //       }

    //       hr {
    //         display: block;
    //         align-self: stretch;
    //         height: 1px;
    //         border: 0;
    //         padding: 0;
    //         margin: var(--lumo-space-s) calc(var(--lumo-border-radius) / 2);
    //         background-color: var(--lumo-contrast-10pct);
    //       }
    //     </style>
    //   </template>
    // </dom-module>

    class Lumo$1 extends HTMLElement {
      static get version() {
        return '1.2.0';
      }
    }

    customElements.define('vaadin-lumo-styles', Lumo$1);

    const $_documentContainer$8 = document.createElement('template');

    $_documentContainer$8.innerHTML = `<custom-style>
  <style>
    html {
      /* Base (background) */
      --lumo-base-color: #FFF;

      /* Tint */
      --lumo-tint-5pct: hsla(0, 0%, 100%, 0.3);
      --lumo-tint-10pct: hsla(0, 0%, 100%, 0.37);
      --lumo-tint-20pct: hsla(0, 0%, 100%, 0.44);
      --lumo-tint-30pct: hsla(0, 0%, 100%, 0.5);
      --lumo-tint-40pct: hsla(0, 0%, 100%, 0.57);
      --lumo-tint-50pct: hsla(0, 0%, 100%, 0.64);
      --lumo-tint-60pct: hsla(0, 0%, 100%, 0.7);
      --lumo-tint-70pct: hsla(0, 0%, 100%, 0.77);
      --lumo-tint-80pct: hsla(0, 0%, 100%, 0.84);
      --lumo-tint-90pct: hsla(0, 0%, 100%, 0.9);
      --lumo-tint: #FFF;

      /* Shade */
      --lumo-shade-5pct: hsla(214, 61%, 25%, 0.05);
      --lumo-shade-10pct: hsla(214, 57%, 24%, 0.1);
      --lumo-shade-20pct: hsla(214, 53%, 23%, 0.16);
      --lumo-shade-30pct: hsla(214, 50%, 22%, 0.26);
      --lumo-shade-40pct: hsla(214, 47%, 21%, 0.38);
      --lumo-shade-50pct: hsla(214, 45%, 20%, 0.5);
      --lumo-shade-60pct: hsla(214, 43%, 19%, 0.61);
      --lumo-shade-70pct: hsla(214, 42%, 18%, 0.72);
      --lumo-shade-80pct: hsla(214, 41%, 17%, 0.83);
      --lumo-shade-90pct: hsla(214, 40%, 16%, 0.94);
      --lumo-shade: hsl(214, 35%, 15%);

      /* Contrast */
      --lumo-contrast-5pct: var(--lumo-shade-5pct);
      --lumo-contrast-10pct: var(--lumo-shade-10pct);
      --lumo-contrast-20pct: var(--lumo-shade-20pct);
      --lumo-contrast-30pct: var(--lumo-shade-30pct);
      --lumo-contrast-40pct: var(--lumo-shade-40pct);
      --lumo-contrast-50pct: var(--lumo-shade-50pct);
      --lumo-contrast-60pct: var(--lumo-shade-60pct);
      --lumo-contrast-70pct: var(--lumo-shade-70pct);
      --lumo-contrast-80pct: var(--lumo-shade-80pct);
      --lumo-contrast-90pct: var(--lumo-shade-90pct);
      --lumo-contrast: var(--lumo-shade);

      /* Text */
      --lumo-header-text-color: var(--lumo-contrast);
      --lumo-body-text-color: var(--lumo-contrast-90pct);
      --lumo-secondary-text-color: var(--lumo-contrast-70pct);
      --lumo-tertiary-text-color: var(--lumo-contrast-50pct);
      --lumo-disabled-text-color: var(--lumo-contrast-30pct);

      /* Primary */
      --lumo-primary-color: hsl(214, 90%, 52%);
      --lumo-primary-color-50pct: hsla(214, 90%, 52%, 0.5);
      --lumo-primary-color-10pct: hsla(214, 90%, 52%, 0.1);
      --lumo-primary-text-color: var(--lumo-primary-color);
      --lumo-primary-contrast-color: #FFF;

      /* Error */
      --lumo-error-color: hsl(3, 100%, 61%);
      --lumo-error-color-50pct: hsla(3, 100%, 60%, 0.5);
      --lumo-error-color-10pct: hsla(3, 100%, 60%, 0.1);
      --lumo-error-text-color: hsl(3, 92%, 53%);
      --lumo-error-contrast-color: #FFF;

      /* Success */
      --lumo-success-color: hsl(145, 80%, 42%); /* hsl(144,82%,37%); */
      --lumo-success-color-50pct: hsla(145, 76%, 44%, 0.55);
      --lumo-success-color-10pct: hsla(145, 76%, 44%, 0.12);
      --lumo-success-text-color: hsl(145, 100%, 32%);
      --lumo-success-contrast-color: #FFF;
    }
  </style>
</custom-style><dom-module id="lumo-color">
  <template>
    <style>
      [theme~="dark"] {
        /* Base (background) */
        --lumo-base-color: hsl(214, 35%, 21%);

        /* Tint */
        --lumo-tint-5pct: hsla(214, 65%, 85%, 0.06);
        --lumo-tint-10pct: hsla(214, 60%, 80%, 0.14);
        --lumo-tint-20pct: hsla(214, 64%, 82%, 0.23);
        --lumo-tint-30pct: hsla(214, 69%, 84%, 0.32);
        --lumo-tint-40pct: hsla(214, 73%, 86%, 0.41);
        --lumo-tint-50pct: hsla(214, 78%, 88%, 0.5);
        --lumo-tint-60pct: hsla(214, 82%, 90%, 0.6);
        --lumo-tint-70pct: hsla(214, 87%, 92%, 0.7);
        --lumo-tint-80pct: hsla(214, 91%, 94%, 0.8);
        --lumo-tint-90pct: hsla(214, 96%, 96%, 0.9);
        --lumo-tint: hsl(214, 100%, 98%);

        /* Shade */
        --lumo-shade-5pct: hsla(214, 0%, 0%, 0.07);
        --lumo-shade-10pct: hsla(214, 4%, 2%, 0.15);
        --lumo-shade-20pct: hsla(214, 8%, 4%, 0.23);
        --lumo-shade-30pct: hsla(214, 12%, 6%, 0.32);
        --lumo-shade-40pct: hsla(214, 16%, 8%, 0.41);
        --lumo-shade-50pct: hsla(214, 20%, 10%, 0.5);
        --lumo-shade-60pct: hsla(214, 24%, 12%, 0.6);
        --lumo-shade-70pct: hsla(214, 28%, 13%, 0.7);
        --lumo-shade-80pct: hsla(214, 32%, 13%, 0.8);
        --lumo-shade-90pct: hsla(214, 33%, 13%, 0.9);
        --lumo-shade: hsl(214, 33%, 13%);

        /* Contrast */
        --lumo-contrast-5pct: var(--lumo-tint-5pct);
        --lumo-contrast-10pct: var(--lumo-tint-10pct);
        --lumo-contrast-20pct: var(--lumo-tint-20pct);
        --lumo-contrast-30pct: var(--lumo-tint-30pct);
        --lumo-contrast-40pct: var(--lumo-tint-40pct);
        --lumo-contrast-50pct: var(--lumo-tint-50pct);
        --lumo-contrast-60pct: var(--lumo-tint-60pct);
        --lumo-contrast-70pct: var(--lumo-tint-70pct);
        --lumo-contrast-80pct: var(--lumo-tint-80pct);
        --lumo-contrast-90pct: var(--lumo-tint-90pct);
        --lumo-contrast: var(--lumo-tint);

        /* Text */
        --lumo-header-text-color: var(--lumo-contrast);
        --lumo-body-text-color: var(--lumo-contrast-90pct);
        --lumo-secondary-text-color: var(--lumo-contrast-70pct);
        --lumo-tertiary-text-color: var(--lumo-contrast-50pct);
        --lumo-disabled-text-color: var(--lumo-contrast-30pct);

        /* Primary */
        --lumo-primary-color: hsl(214, 86%, 55%);
        --lumo-primary-color-50pct: hsla(214, 86%, 55%, 0.5);
        --lumo-primary-color-10pct: hsla(214, 90%, 63%, 0.1);
        --lumo-primary-text-color: hsl(214, 100%, 70%);
        --lumo-primary-contrast-color: #FFF;

        /* Error */
        --lumo-error-color: hsl(3, 90%, 63%);
        --lumo-error-color-50pct: hsla(3, 90%, 63%, 0.5);
        --lumo-error-color-10pct: hsla(3, 90%, 63%, 0.1);
        --lumo-error-text-color: hsl(3, 100%, 67%);

        /* Success */
        --lumo-success-color: hsl(145, 65%, 42%);
        --lumo-success-color-50pct: hsla(145, 65%, 42%, 0.5);
        --lumo-success-color-10pct: hsla(145, 65%, 42%, 0.1);
        --lumo-success-text-color: hsl(145, 85%, 47%);
      }

      html {
        color: var(--lumo-body-text-color);
        background-color: var(--lumo-base-color);
      }

      [theme~="dark"] {
        color: var(--lumo-body-text-color);
        background-color: var(--lumo-base-color);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: var(--lumo-header-text-color);
      }

      a {
        color: var(--lumo-primary-text-color);
      }
    </style>
  </template>
</dom-module><dom-module id="lumo-color-legacy">
  <template>
    <style include="lumo-color">
      :host {
        color: var(--lumo-body-text-color) !important;
        background-color: var(--lumo-base-color) !important;
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$8.content);

    const $_documentContainer$9 = document.createElement('template');

    $_documentContainer$9.innerHTML = `<custom-style>
  <style>
    html {
      --lumo-size-xs: 1.625rem;
      --lumo-size-s: 1.875rem;
      --lumo-size-m: 2.25rem;
      --lumo-size-l: 2.75rem;
      --lumo-size-xl: 3.5rem;

      /* Icons */
      --lumo-icon-size-s: 1.25em;
      --lumo-icon-size-m: 1.5em;
      --lumo-icon-size-l: 2.25em;
      /* For backwards compatibility */
      --lumo-icon-size: var(--lumo-icon-size-m);
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$9.content);

    const $_documentContainer$a = document.createElement('template');

    $_documentContainer$a.innerHTML = `<custom-style>
  <style>
    html {
      /* Square */
      --lumo-space-xs: 0.25rem;
      --lumo-space-s: 0.5rem;
      --lumo-space-m: 1rem;
      --lumo-space-l: 1.5rem;
      --lumo-space-xl: 2.5rem;

      /* Wide */
      --lumo-space-wide-xs: calc(var(--lumo-space-xs) / 2) var(--lumo-space-xs);
      --lumo-space-wide-s: calc(var(--lumo-space-s) / 2) var(--lumo-space-s);
      --lumo-space-wide-m: calc(var(--lumo-space-m) / 2) var(--lumo-space-m);
      --lumo-space-wide-l: calc(var(--lumo-space-l) / 2) var(--lumo-space-l);
      --lumo-space-wide-xl: calc(var(--lumo-space-xl) / 2) var(--lumo-space-xl);

      /* Tall */
      --lumo-space-tall-xs: var(--lumo-space-xs) calc(var(--lumo-space-xs) / 2);
      --lumo-space-tall-s: var(--lumo-space-s) calc(var(--lumo-space-s) / 2);
      --lumo-space-tall-m: var(--lumo-space-m) calc(var(--lumo-space-m) / 2);
      --lumo-space-tall-l: var(--lumo-space-l) calc(var(--lumo-space-l) / 2);
      --lumo-space-tall-xl: var(--lumo-space-xl) calc(var(--lumo-space-xl) / 2);
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$a.content);

    const $_documentContainer$b = document.createElement('template');

    $_documentContainer$b.innerHTML = `<custom-style>
  <style>
    html {
      --lumo-border-radius: 0.25em;

      /* Shadows */
      --lumo-box-shadow-s: 0 1px 2px 0 var(--lumo-shade-20pct), 0 2px 8px -2px var(--lumo-shade-40pct);
      --lumo-box-shadow-m: 0 2px 6px -1px var(--lumo-shade-20pct), 0 8px 24px -4px var(--lumo-shade-40pct);
      --lumo-box-shadow-l: 0 3px 18px -2px var(--lumo-shade-20pct), 0 12px 48px -6px var(--lumo-shade-40pct);
      --lumo-box-shadow-xl: 0 4px 24px -3px var(--lumo-shade-20pct), 0 18px 64px -8px var(--lumo-shade-40pct);
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$b.content);

    const $_documentContainer$c = document.createElement('template');

    $_documentContainer$c.innerHTML = `<custom-style>
  <style>
    html {
      /* Font families */
      --lumo-font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

      /* Font sizes */
      --lumo-font-size-xxs: .75rem;
      --lumo-font-size-xs: .8125rem;
      --lumo-font-size-s: .875rem;
      --lumo-font-size-m: 1rem;
      --lumo-font-size-l: 1.125rem;
      --lumo-font-size-xl: 1.375rem;
      --lumo-font-size-xxl: 1.75rem;
      --lumo-font-size-xxxl: 2.5rem;

      /* Line heights */
      --lumo-line-height-xs: 1.25;
      --lumo-line-height-s: 1.375;
      --lumo-line-height-m: 1.625;
    }

  </style>
</custom-style><dom-module id="lumo-typography">
  <template>
    <style>
      html {
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size, var(--lumo-font-size-m));
        line-height: var(--lumo-line-height-m);
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Can’t combine with the above selector because that doesn’t work in browsers without native shadow dom */
      :host {
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size, var(--lumo-font-size-m));
        line-height: var(--lumo-line-height-m);
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      small,
      [theme~="font-size-s"] {
        font-size: var(--lumo-font-size-s);
        line-height: var(--lumo-line-height-s);
      }

      [theme~="font-size-xs"] {
        font-size: var(--lumo-font-size-xs);
        line-height: var(--lumo-line-height-xs);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 600;
        line-height: var(--lumo-line-height-xs);
        margin-top: 1.25em;
      }

      h1 {
        font-size: var(--lumo-font-size-xxxl);
        margin-bottom: 0.75em;
      }

      h2 {
        font-size: var(--lumo-font-size-xxl);
        margin-bottom: 0.5em;
      }

      h3 {
        font-size: var(--lumo-font-size-xl);
        margin-bottom: 0.5em;
      }

      h4 {
        font-size: var(--lumo-font-size-l);
        margin-bottom: 0.5em;
      }

      h5 {
        font-size: var(--lumo-font-size-m);
        margin-bottom: 0.25em;
      }

      h6 {
        font-size: var(--lumo-font-size-xs);
        margin-bottom: 0;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      p {
        margin-top: 0.5em;
        margin-bottom: 0.75em;
      }

      a {
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      hr {
        display: block;
        align-self: stretch;
        height: 1px;
        border: 0;
        padding: 0;
        margin: var(--lumo-space-s) calc(var(--lumo-border-radius) / 2);
        background-color: var(--lumo-contrast-10pct);
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$c.content);

    const $_documentContainer$d = document.createElement('template');

    $_documentContainer$d.innerHTML = `<dom-module id="lumo-button" theme-for="vaadin-button">
  <template>
    <style>
      :host {
        /* Sizing */
        --lumo-button-size: var(--lumo-size-m);
        min-width: calc(var(--lumo-button-size) * 2);
        height: var(--lumo-button-size);
        padding: 0 calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius) / 2);
        margin: var(--lumo-space-xs) 0;
        box-sizing: border-box;
        /* Style */
        font-family: var(--lumo-font-family);
        font-size: var(--lumo-font-size-m);
        font-weight: 500;
        color: var(--lumo-primary-text-color);
        background-color: var(--lumo-contrast-5pct);
        border-radius: var(--lumo-border-radius);
        cursor: default;
        -webkit-tap-highlight-color: transparent;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Set only for the internal parts so we don’t affect the host vertical alignment */
      [part="label"],
      [part="prefix"],
      [part="suffix"] {
        line-height: var(--lumo-line-height-xs);
      }

      [part="label"] {
        padding: calc(var(--lumo-button-size) / 6) 0;
      }

      :host([theme~="small"]) {
        font-size: var(--lumo-font-size-s);
        --lumo-button-size: var(--lumo-size-s);
      }

      :host([theme~="large"]) {
        font-size: var(--lumo-font-size-l);
        --lumo-button-size: var(--lumo-size-l);
      }

      /* This needs to be the last selector for it to take priority */
      :host([disabled][disabled]) {
        pointer-events: none;
        color: var(--lumo-disabled-text-color);
        background-color: var(--lumo-contrast-5pct);
      }

      /* For interaction states */
      :host::before,
      :host::after {
        content: "";
        /* We rely on the host always being relative */
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: currentColor;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }

      /* Hover */

      :host(:hover)::before {
        opacity: 0.05;
      }

      /* Disable hover for touch devices */
      @media (pointer: coarse) {
        :host(:not([active]):hover)::before {
          opacity: 0;
        }
      }

      /* Active */

      :host::after {
        transition: opacity 1.4s, transform 0.1s;
        filter: blur(8px);
      }

      :host([active])::before {
        opacity: 0.1;
        transition-duration: 0s;
      }

      :host([active])::after {
        opacity: 0.1;
        transition-duration: 0s, 0s;
        transform: scale(0);
      }

      /* Keyboard focus */

      :host([focus-ring]) {
        box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
      }

      /* Types (primary, tertiary, tertiary-inline */

      :host([theme~="tertiary"]),
      :host([theme~="tertiary-inline"]) {
        background-color: transparent !important;
        transition: opacity 0.2s;
        min-width: 0;
      }

      :host([theme~="tertiary"])::before,
      :host([theme~="tertiary-inline"])::before {
        display: none;
      }

      :host([theme~="tertiary"]) {
        padding: 0 calc(var(--lumo-button-size) / 6);
      }

      @media (hover: hover) {
        :host([theme*="tertiary"]:not([active]):hover) {
          opacity: 0.8;
        }
      }

      :host([theme~="tertiary"][active]),
      :host([theme~="tertiary-inline"][active]) {
        opacity: 0.5;
        transition-duration: 0s;
      }

      :host([theme~="tertiary-inline"]) {
        margin: 0;
        height: auto;
        padding: 0;
        line-height: inherit;
        font-size: inherit;
      }

      :host([theme~="tertiary-inline"]) [part="label"] {
        padding: 0;
        line-height: inherit;
      }

      :host([theme~="primary"]) {
        background-color: var(--lumo-primary-color);
        color: var(--lumo-primary-contrast-color);
        font-weight: 600;
        min-width: calc(var(--lumo-button-size) * 2.5);
      }

      :host([theme~="primary"]:hover)::before {
        opacity: 0.1;
      }

      :host([theme~="primary"][active])::before {
        background-color: var(--lumo-shade-20pct);
      }

      @media (pointer: coarse) {
        :host([theme~="primary"][active])::before {
          background-color: var(--lumo-shade-60pct);
        }

        :host([theme~="primary"]:not([active]):hover)::before {
          opacity: 0;
        }
      }

      :host([theme~="primary"][active])::after {
        opacity: 0.2;
      }

      /* Colors (success, error, contrast) */

      :host([theme~="success"]) {
        color: var(--lumo-success-text-color);
      }

      :host([theme~="success"][theme~="primary"]) {
        background-color: var(--lumo-success-color);
        color: var(--lumo-success-contrast-color);
      }

      :host([theme~="error"]) {
        color: var(--lumo-error-text-color);
      }

      :host([theme~="error"][theme~="primary"]) {
        background-color: var(--lumo-error-color);
        color: var(--lumo-error-contrast-color);
      }

      :host([theme~="contrast"]) {
        color: var(--lumo-contrast);
      }

      :host([theme~="contrast"][theme~="primary"]) {
        background-color: var(--lumo-contrast);
        color: var(--lumo-base-color);
      }

      /* Icons */

      [part] ::slotted(iron-icon) {
        display: inline-block;
        width: var(--lumo-icon-size-m);
        height: var(--lumo-icon-size-m);
      }

      /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
      [part] ::slotted(iron-icon[icon^="vaadin:"]) {
        padding: 0.25em;
        box-sizing: border-box !important;
      }

      [part="prefix"] {
        margin-left: -0.25em;
        margin-right: 0.25em;
      }

      [part="suffix"] {
        margin-left: 0.25em;
        margin-right: -0.25em;
      }

      /* Icon-only */

      :host([theme~="icon"]) {
        min-width: var(--lumo-button-size);
        padding-left: calc(var(--lumo-button-size) / 4);
        padding-right: calc(var(--lumo-button-size) / 4);
      }

      :host([theme~="icon"]) [part="prefix"],
      :host([theme~="icon"]) [part="suffix"] {
        margin-left: 0;
        margin-right: 0;
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$d.content);

    /**
     * @polymerMixin
     */
    const ThemableMixin = superClass => class VaadinThemableMixin extends superClass {

      /** @protected */
      static finalize() {
        super.finalize();

        const template = this.prototype._template;

        const hasOwnTemplate = this.template && this.template.parentElement && this.template.parentElement.id === this.is;
        const inheritedTemplate = Object.getPrototypeOf(this.prototype)._template;
        if (inheritedTemplate && !hasOwnTemplate) {
          // The element doesn't define its own template -> include the theme modules from the inherited template
          Array.from(inheritedTemplate.content.querySelectorAll('style[include]')).forEach(s => {
            this._includeStyle(s.getAttribute('include'), template);
          });
        }

        this._includeMatchingThemes(template);
      }

      /** @protected */
      static _includeMatchingThemes(template) {
        const domModule = DomModule;
        const modules = domModule.prototype.modules;

        let hasThemes = false;
        const defaultModuleName = this.is + '-default-theme';

        Object.keys(modules).forEach(moduleName => {
          if (moduleName !== defaultModuleName) {
            const themeFor = modules[moduleName].getAttribute('theme-for');
            if (themeFor) {
              themeFor.split(' ').forEach(themeForToken => {
                if (new RegExp('^' + themeForToken.split('*').join('.*') + '$').test(this.is)) {
                  hasThemes = true;
                  this._includeStyle(moduleName, template);
                }
              });
            }
          }
        });

        if (!hasThemes && modules[defaultModuleName]) {
          // No theme modules found, include the default module if it exists
          this._includeStyle(defaultModuleName, template);
        }
      }

      /** @private */
      static _includeStyle(moduleName, template) {
        if (template && !template.content.querySelector(`style[include=${moduleName}]`)) {
          const styleEl = document.createElement('style');
          styleEl.setAttribute('include', moduleName);
          template.content.appendChild(styleEl);
        }
      }

    };

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    /**
     * A private mixin to avoid problems with dynamic properties and Polymer Analyzer.
     * No need to expose these properties in the API docs.
     * @polymerMixin
     */
    const TabIndexMixin = superClass => class VaadinTabIndexMixin extends superClass {
      static get properties() {
        var properties = {
          /**
           * Internal property needed to listen to `tabindex` attribute changes.
           *
           * For changing the tabindex of this component use the native `tabIndex` property.
           * @private
           */
          tabindex: {
            type: Number,
            value: 0,
            reflectToAttribute: true,
            observer: '_tabindexChanged'
          }
        };

        if (window.ShadyDOM) {
          // ShadyDOM browsers need the `tabIndex` in order to notify when the user changes it programmatically.
          properties['tabIndex'] = properties.tabindex;
        }

        return properties;
      }
    };

    /**
     * Polymer.IronControlState is not a proper 2.0 class, also, its tabindex
     * implementation fails in the shadow dom, so we have this for vaadin elements.
     * @polymerMixin
     */
    const ControlStateMixin = superClass => class VaadinControlStateMixin extends TabIndexMixin(superClass) {
      static get properties() {
        return {
          /**
           * Specify that this control should have input focus when the page loads.
           */
          autofocus: {
            type: Boolean
          },

          /**
           * Stores the previous value of tabindex attribute of the disabled element
           */
          _previousTabIndex: {
            type: Number
          },

          /**
           * If true, the user cannot interact with this element.
           */
          disabled: {
            type: Boolean,
            observer: '_disabledChanged',
            reflectToAttribute: true
          },

          _isShiftTabbing: {
            type: Boolean
          }
        };
      }

      ready() {
        this.addEventListener('focusin', e => {
          if (e.composedPath()[0] === this) {
            this._focus(e);
          } else if (e.composedPath().indexOf(this.focusElement) !== -1 && !this.disabled) {
            this._setFocused(true);
          }
        });
        this.addEventListener('focusout', e => this._setFocused(false));

        // In super.ready() other 'focusin' and 'focusout' listeners might be
        // added, so we call it after our own ones to ensure they execute first.
        // Issue to watch out: when incorrect, <vaadin-combo-box> refocuses the
        // input field on iOS after “Done” is pressed.
        super.ready();

        // This fixes the bug in Firefox 61 (https://bugzilla.mozilla.org/show_bug.cgi?id=1472887)
        // where focusout event does not go out of shady DOM because composed property in the event is not true
        const ensureEventComposed = e => {
          if (!e.composed) {
            e.target.dispatchEvent(new CustomEvent(e.type, {
              bubbles: true,
              composed: true,
              cancelable: false
            }));
          }
        };
        this.shadowRoot.addEventListener('focusin', ensureEventComposed);
        this.shadowRoot.addEventListener('focusout', ensureEventComposed);

        this.addEventListener('keydown', e => {
          if (!e.defaultPrevented && e.shiftKey && e.keyCode === 9) {
            // Flag is checked in _focus event handler.
            this._isShiftTabbing = true;
            HTMLElement.prototype.focus.apply(this);
            this._setFocused(false);
            // Event handling in IE is asynchronous and the flag is removed asynchronously as well
            setTimeout(() => this._isShiftTabbing = false, 0);
          }
        });

        if (this.autofocus && !this.focused && !this.disabled) {
          window.requestAnimationFrame(() => {
            this._focus();
            this._setFocused(true);
            this.setAttribute('focus-ring', '');
          });
        }

        this._boundKeydownListener = this._bodyKeydownListener.bind(this);
        this._boundKeyupListener = this._bodyKeyupListener.bind(this);
      }

      /**
       * @protected
       */
      connectedCallback() {
        super.connectedCallback();

        document.body.addEventListener('keydown', this._boundKeydownListener, true);
        document.body.addEventListener('keyup', this._boundKeyupListener, true);
      }

      /**
       * @protected
       */
      disconnectedCallback() {
        super.disconnectedCallback();

        document.body.removeEventListener('keydown', this._boundKeydownListener, true);
        document.body.removeEventListener('keyup', this._boundKeyupListener, true);

        // in non-Chrome browsers, blur does not fire on the element when it is disconnected.
        // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
        if (this.hasAttribute('focused')) {
          this._setFocused(false);
        }
      }

      _setFocused(focused) {
        if (focused) {
          this.setAttribute('focused', '');
        } else {
          this.removeAttribute('focused');
        }

        // focus-ring is true when the element was focused from the keyboard.
        // Focus Ring [A11ycasts]: https://youtu.be/ilj2P5-5CjI
        if (focused && this._tabPressed) {
          this.setAttribute('focus-ring', '');
        } else {
          this.removeAttribute('focus-ring');
        }
      }

      _bodyKeydownListener(e) {
        this._tabPressed = e.keyCode === 9;
      }

      _bodyKeyupListener() {
        this._tabPressed = false;
      }

      /**
       * Any element extending this mixin is required to implement this getter.
       * It returns the actual focusable element in the component.
       */
      get focusElement() {
        window.console.warn(`Please implement the 'focusElement' property in <${this.localName}>`);
        return this;
      }

      _focus(e) {
        if (this._isShiftTabbing) {
          return;
        }

        this.focusElement.focus();
        this._setFocused(true);
      }

      /**
       * Moving the focus from the host element causes firing of the blur event what leads to problems in IE.
       * @private
       */
      focus() {
        if (this.disabled) {
          return;
        }

        this.focusElement.focus();
        this._setFocused(true);
      }

      /**
       * Native bluring in the host element does nothing because it does not have the focus.
       * In chrome it works, but not in FF.
       * @private
       */
      blur() {
        this.focusElement.blur();
        this._setFocused(false);
      }

      _disabledChanged(disabled) {
        this.focusElement.disabled = disabled;
        if (disabled) {
          this.blur();
          this._previousTabIndex = this.tabindex;
          this.tabindex = -1;
          this.setAttribute('aria-disabled', 'true');
        } else {
          if (typeof this._previousTabIndex !== 'undefined') {
            this.tabindex = this._previousTabIndex;
          }
          this.removeAttribute('aria-disabled');
        }
      }

      _tabindexChanged(tabindex) {
        if (tabindex !== undefined) {
          this.focusElement.tabIndex = tabindex;
        }

        if (this.disabled && this.tabindex) {
          // If tabindex attribute was changed while checkbox was disabled
          if (this.tabindex !== -1) {
            this._previousTabIndex = this.tabindex;
          }
          this.tabindex = tabindex = undefined;
        }

        if (window.ShadyDOM) {
          this.setProperties({tabIndex: tabindex, tabindex: tabindex});
        }
      }
    };

    const DEV_MODE_CODE_REGEXP$1 =
      /\/\*\*\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i;

    function isMinified$1() {
      function test() {
        /** vaadin-dev-mode:start
        return false;
        vaadin-dev-mode:end **/
        return true;
      }
      return uncommentAndRun$1(test);
    }

    function isDevelopmentMode$1() {
      try {
        return isForcedDevelopmentMode$1() || (isLocalhost$1() && !isMinified$1() && !isFlowProductionMode$1());
      } catch (e) {
        // Some error in this code, assume production so no further actions will be taken
        return false;
      }
    }

    function isForcedDevelopmentMode$1() {
      return localStorage.getItem("vaadin.developmentmode.force");
    }

    function isLocalhost$1() {
      return (["localhost","127.0.0.1"].indexOf(window.location.hostname) >= 0);
    }

    function isFlowProductionMode$1() {
      if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
        const productionModeApps = Object.keys(window.Vaadin.Flow.clients)
        .map(key => window.Vaadin.Flow.clients[key])
        .filter(client => client.productionMode);
        if (productionModeApps.length > 0) {
          return true;
        }
      }
      return false;
    }

    function uncommentAndRun$1(callback, args) {
      if (typeof callback !== 'function') {
        return;
      }

      const match = DEV_MODE_CODE_REGEXP$1.exec(callback.toString());
      if (match) {
        try {
          // requires CSP: script-src 'unsafe-eval'
          callback = new Function(match[1]);
        } catch (e) {
          // eat the exception
          console.log('vaadin-development-mode-detector: uncommentAndRun() failed', e);
        }
      }

      return callback(args);
    }

    // A guard against polymer-modulizer removing the window.Vaadin
    // initialization above.
    window['Vaadin'] = window['Vaadin'] || {};

    /**
     * Inspects the source code of the given `callback` function for
     * specially-marked _commented_ code. If such commented code is found in the
     * callback source, uncomments and runs that code instead of the callback
     * itself. Otherwise runs the callback as is.
     *
     * The optional arguments are passed into the callback / uncommented code,
     * the result is returned.
     *
     * See the `isMinified()` function source code in this file for an example.
     *
     */
    const runIfDevelopmentMode$1 = function(callback, args) {
      if (window.Vaadin.developmentMode) {
        return uncommentAndRun$1(callback, args);
      }
    };

    if (window.Vaadin.developmentMode === undefined) {
      window.Vaadin.developmentMode = isDevelopmentMode$1();
    }

    /* This file is autogenerated from src/vaadin-usage-statistics.tpl.html */

    function maybeGatherAndSendStats$1() {
      /** vaadin-dev-mode:start
      (function () {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var getPolymerVersion = function getPolymerVersion() {
      return window.Polymer && window.Polymer.version;
    };

    var StatisticsGatherer = function () {
      function StatisticsGatherer(logger) {
        classCallCheck(this, StatisticsGatherer);

        this.now = new Date().getTime();
        this.logger = logger;
      }

      createClass(StatisticsGatherer, [{
        key: 'frameworkVersionDetectors',
        value: function frameworkVersionDetectors() {
          return {
            'Flow': function Flow() {
              if (window.Vaadin && window.Vaadin.Flow && window.Vaadin.Flow.clients) {
                var flowVersions = Object.keys(window.Vaadin.Flow.clients).map(function (key) {
                  return window.Vaadin.Flow.clients[key];
                }).filter(function (client) {
                  return client.getVersionInfo;
                }).map(function (client) {
                  return client.getVersionInfo().flow;
                });
                if (flowVersions.length > 0) {
                  return flowVersions[0];
                }
              }
            },
            'Vaadin Framework': function VaadinFramework() {
              if (window.vaadin && window.vaadin.clients) {
                var frameworkVersions = Object.values(window.vaadin.clients).filter(function (client) {
                  return client.getVersionInfo;
                }).map(function (client) {
                  return client.getVersionInfo().vaadinVersion;
                });
                if (frameworkVersions.length > 0) {
                  return frameworkVersions[0];
                }
              }
            },
            'AngularJs': function AngularJs() {
              if (window.angular && window.angular.version && window.angular.version) {
                return window.angular.version.full;
              }
            },
            'Angular': function Angular() {
              if (window.ng) {
                var tags = document.querySelectorAll("[ng-version]");
                if (tags.length > 0) {
                  return tags[0].getAttribute("ng-version");
                }
                return "Unknown";
              }
            },
            'Backbone.js': function BackboneJs() {
              if (window.Backbone) {
                return window.Backbone.VERSION;
              }
            },
            'React': function React() {
              var reactSelector = '[data-reactroot], [data-reactid]';
              if (!!document.querySelector(reactSelector)) {
                // React does not publish the version by default
                return "unknown";
              }
            },
            'Ember': function Ember() {
              if (window.Em && window.Em.VERSION) {
                return window.Em.VERSION;
              } else if (window.Ember && window.Ember.VERSION) {
                return window.Ember.VERSION;
              }
            },
            'jQuery': function (_jQuery) {
              function jQuery() {
                return _jQuery.apply(this, arguments);
              }

              jQuery.toString = function () {
                return _jQuery.toString();
              };

              return jQuery;
            }(function () {
              if (typeof jQuery === 'function' && jQuery.prototype.jquery !== undefined) {
                return jQuery.prototype.jquery;
              }
            }),
            'Polymer': function Polymer() {
              var version = getPolymerVersion();
              if (version) {
                return version;
              }
            },
            'Vue.js': function VueJs() {
              if (window.Vue) {
                return window.Vue.version;
              }
            }
          };
        }
      }, {
        key: 'getUsedVaadinElements',
        value: function getUsedVaadinElements(elements) {
          var version = getPolymerVersion();
          var elementClasses = void 0;
          if (version && version.indexOf('2') === 0) {
            // Polymer 2: components classes are stored in window.Vaadin
            elementClasses = Object.keys(window.Vaadin).map(function (c) {
              return window.Vaadin[c];
            }).filter(function (c) {
              return c.is;
            });
          } else {
            // Polymer 3: components classes are stored in window.Vaadin.registrations
            elementClasses = window.Vaadin.registrations || [];
          }
          elementClasses.forEach(function (klass) {
            var version = klass.version ? klass.version : "0.0.0";
            elements[klass.is] = { version: version };
          });
        }
      }, {
        key: 'getUsedVaadinThemes',
        value: function getUsedVaadinThemes(themes) {
          ['Lumo', 'Material'].forEach(function (themeName) {
            var theme;
            var version = getPolymerVersion();
            if (version && version.indexOf('2') === 0) {
              // Polymer 2: themes are stored in window.Vaadin
              theme = window.Vaadin[themeName];
            } else {
              // Polymer 3: themes are stored in custom element registry
              theme = customElements.get('vaadin-' + themeName.toLowerCase() + '-styles');
            }
            if (theme && theme.version) {
              themes[themeName] = { version: theme.version };
            }
          });
        }
      }, {
        key: 'getFrameworks',
        value: function getFrameworks(frameworks) {
          var detectors = this.frameworkVersionDetectors();
          Object.keys(detectors).forEach(function (framework) {
            var detector = detectors[framework];
            try {
              var version = detector();
              if (version) {
                frameworks[framework] = { "version": version };
              }
            } catch (e) {}
          });
        }
      }, {
        key: 'gather',
        value: function gather(storage) {
          var storedStats = storage.read();
          var gatheredStats = {};
          var types = ["elements", "frameworks", "themes"];

          types.forEach(function (type) {
            gatheredStats[type] = {};
            if (!storedStats[type]) {
              storedStats[type] = {};
            }
          });

          var previousStats = JSON.stringify(storedStats);

          this.getUsedVaadinElements(gatheredStats.elements);
          this.getFrameworks(gatheredStats.frameworks);
          this.getUsedVaadinThemes(gatheredStats.themes);

          var now = this.now;
          types.forEach(function (type) {
            var keys = Object.keys(gatheredStats[type]);
            keys.forEach(function (key) {
              if (!storedStats[type][key] || _typeof(storedStats[type][key]) != _typeof({})) {
                storedStats[type][key] = { "firstUsed": now };
              }
              // Discards any previously logged version numebr
              storedStats[type][key].version = gatheredStats[type][key].version;
              storedStats[type][key].lastUsed = now;
            });
          });

          var newStats = JSON.stringify(storedStats);
          storage.write(newStats);
          if (newStats != previousStats && Object.keys(storedStats).length > 0) {
            this.logger.debug("New stats: " + newStats);
          }
        }
      }]);
      return StatisticsGatherer;
    }();

    var StatisticsStorage = function () {
      function StatisticsStorage(key) {
        classCallCheck(this, StatisticsStorage);

        this.key = key;
      }

      createClass(StatisticsStorage, [{
        key: 'read',
        value: function read() {
          var localStorageStatsString = localStorage.getItem(this.key);
          try {
            return JSON.parse(localStorageStatsString ? localStorageStatsString : '{}');
          } catch (e) {
            return {};
          }
        }
      }, {
        key: 'write',
        value: function write(data) {
          localStorage.setItem(this.key, data);
        }
      }, {
        key: 'clear',
        value: function clear() {
          localStorage.removeItem(this.key);
        }
      }, {
        key: 'isEmpty',
        value: function isEmpty() {
          var storedStats = this.read();
          var empty = true;
          Object.keys(storedStats).forEach(function (key) {
            if (Object.keys(storedStats[key]).length > 0) {
              empty = false;
            }
          });

          return empty;
        }
      }]);
      return StatisticsStorage;
    }();

    var StatisticsSender = function () {
      function StatisticsSender(url, logger) {
        classCallCheck(this, StatisticsSender);

        this.url = url;
        this.logger = logger;
      }

      createClass(StatisticsSender, [{
        key: 'send',
        value: function send(data, errorHandler) {
          var logger = this.logger;

          if (navigator.onLine === false) {
            logger.debug("Offline, can't send");
            errorHandler();
            return;
          }
          logger.debug("Sending data to " + this.url);

          var req = new XMLHttpRequest();
          req.withCredentials = true;
          req.addEventListener("load", function () {
            // Stats sent, nothing more to do
            logger.debug("Response: " + req.responseText);
          });
          req.addEventListener("error", function () {
            logger.debug("Send failed");
            errorHandler();
          });
          req.addEventListener("abort", function () {
            logger.debug("Send aborted");
            errorHandler();
          });
          req.open("POST", this.url);
          req.setRequestHeader("Content-Type", "application/json");
          req.send(data);
        }
      }]);
      return StatisticsSender;
    }();

    var StatisticsLogger = function () {
      function StatisticsLogger(id) {
        classCallCheck(this, StatisticsLogger);

        this.id = id;
      }

      createClass(StatisticsLogger, [{
        key: '_isDebug',
        value: function _isDebug() {
          return localStorage.getItem("vaadin." + this.id + ".debug");
        }
      }, {
        key: 'debug',
        value: function debug(msg) {
          if (this._isDebug()) {
            console.info(this.id + ": " + msg);
          }
        }
      }]);
      return StatisticsLogger;
    }();

    var UsageStatistics = function () {
      function UsageStatistics() {
        classCallCheck(this, UsageStatistics);

        this.now = new Date();
        this.timeNow = this.now.getTime();
        this.gatherDelay = 10; // Delay between loading this file and gathering stats
        this.initialDelay = 24 * 60 * 60;

        this.logger = new StatisticsLogger("statistics");
        this.storage = new StatisticsStorage("vaadin.statistics.basket");
        this.gatherer = new StatisticsGatherer(this.logger);
        this.sender = new StatisticsSender("https://tools.vaadin.com/usage-stats/submit", this.logger);
      }

      createClass(UsageStatistics, [{
        key: 'maybeGatherAndSend',
        value: function maybeGatherAndSend() {
          var _this = this;

          if (localStorage.getItem(UsageStatistics.optOutKey)) {
            return;
          }
          this.gatherer.gather(this.storage);
          setTimeout(function () {
            _this.maybeSend();
          }, this.gatherDelay * 1000);
        }
      }, {
        key: 'lottery',
        value: function lottery() {
          return Math.random() <= 0.05;
        }
      }, {
        key: 'currentMonth',
        value: function currentMonth() {
          return this.now.getYear() * 12 + this.now.getMonth();
        }
      }, {
        key: 'maybeSend',
        value: function maybeSend() {
          var firstUse = Number(localStorage.getItem(UsageStatistics.firstUseKey));
          var monthProcessed = Number(localStorage.getItem(UsageStatistics.monthProcessedKey));

          if (!firstUse) {
            // Use a grace period to avoid interfering with tests, incognito mode etc
            firstUse = this.timeNow;
            localStorage.setItem(UsageStatistics.firstUseKey, firstUse);
          }

          if (this.timeNow < firstUse + this.initialDelay * 1000) {
            this.logger.debug("No statistics will be sent until the initial delay of " + this.initialDelay + "s has passed");
            return;
          }
          if (this.currentMonth() <= monthProcessed) {
            this.logger.debug("This month has already been processed");
            return;
          }
          localStorage.setItem(UsageStatistics.monthProcessedKey, this.currentMonth());
          // Use random sampling
          if (this.lottery()) {
            this.logger.debug("Congratulations, we have a winner!");
          } else {
            this.logger.debug("Sorry, no stats from you this time");
            return;
          }

          this.send();
        }
      }, {
        key: 'send',
        value: function send() {
          // Ensure we have the latest data
          this.gatherer.gather(this.storage);

          // Read, send and clean up
          var data = this.storage.read();
          data["firstUse"] = Number(localStorage.getItem(UsageStatistics.firstUseKey));
          data["usageStatisticsVersion"] = UsageStatistics.version;
          var info = 'This request contains usage statistics gathered from the application running in development mode. \n\nStatistics gathering is automatically disabled and excluded from production builds.\n\nFor details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.\n\n\n\n';
          var self = this;
          this.sender.send(info + JSON.stringify(data), function () {
            // Revert the 'month processed' flag
            localStorage.setItem(UsageStatistics.monthProcessedKey, self.currentMonth() - 1);
          });
        }
      }], [{
        key: 'version',
        get: function get$1() {
          return '2.0.1';
        }
      }, {
        key: 'firstUseKey',
        get: function get$1() {
          return 'vaadin.statistics.firstuse';
        }
      }, {
        key: 'monthProcessedKey',
        get: function get$1() {
          return 'vaadin.statistics.monthProcessed';
        }
      }, {
        key: 'optOutKey',
        get: function get$1() {
          return 'vaadin.statistics.optout';
        }
      }]);
      return UsageStatistics;
    }();

    try {
      window.Vaadin = window.Vaadin || {};
      window.Vaadin.usageStatistics = window.Vaadin.usageStatistics || new UsageStatistics();
      window.Vaadin.usageStatistics.maybeGatherAndSend();
    } catch (e) {
      // Intentionally ignored as this is not a problem in the app being developed
    }

    }());

      vaadin-dev-mode:end **/
    }

    const usageStatistics$1 = function() {
      if (typeof runIfDevelopmentMode$1 === 'function') {
        return runIfDevelopmentMode$1(maybeGatherAndSendStats$1);
      }
    };

    if (!window.Vaadin) {
      window['Vaadin'] = {};
    }

    /**
     * Array of Vaadin custom element classes that have been finalized.
     */
    window['Vaadin'].registrations = window.Vaadin.registrations || [];

    // Use the hack to prevent polymer-modulizer from converting to exports
    window['Vaadin'].developmentModeCallback = window.Vaadin.developmentModeCallback || {};
    window['Vaadin'].developmentModeCallback['vaadin-usage-statistics'] = function() {
      if (usageStatistics$1) {
        usageStatistics$1();
      }
    };

    let statsJob;

    /**
     * @polymerMixin
     */
    const ElementMixin$1 = superClass => class VaadinElementMixin extends superClass {
      /** @protected */
      static _finalizeClass() {
        super._finalizeClass();

        // Registers a class prototype for telemetry purposes.
        if (this.is) {
          window.Vaadin.registrations.push(this);

          if (window.Vaadin.developmentModeCallback) {
            statsJob = Debouncer.debounce(statsJob,
              idlePeriod, () => {
                window.Vaadin.developmentModeCallback['vaadin-usage-statistics']();
              }
            );
            enqueueDebouncer(statsJob);
          }
        }
      }
      ready() {
        super.ready();
        if (document.doctype === null) {
          console.warn(
            'Vaadin components require the "standards mode" declaration. Please add <!DOCTYPE html> to the HTML document.'
          );
        }
      }
    };

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    /**
     * `<vaadin-button>` is a Web Component providing an accessible and customizable button.
     *
     * ```html
     * <vaadin-button>
     * </vaadin-button>
     * ```
     *
     * ```js
     * document.querySelector('vaadin-button').addEventListener('click', () => alert('Hello World!'));
     * ```
     *
     * ### Styling
     *
     * The following shadow DOM parts are exposed for styling:
     *
     * Part name | Description
     * ----------------|----------------
     * `label` | The label (text) inside the button
     * `prefix` | A slot for e.g. an icon before the label
     * `suffix` | A slot for e.g. an icon after the label
     *
     *
     * The following attributes are exposed for styling:
     *
     * Attribute | Description
     * --------- | -----------
     * `active` | Set when the button is pressed down, either with mouse, touch or the keyboard.
     * `disabled` | Set when the button is disabled.
     * `focus-ring` | Set when the button is focused using the keyboard.
     * `focused` | Set when the button is focused.
     *
     * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
     *
     * @memberof Vaadin
     * @mixes Vaadin.ElementMixin
     * @mixes Vaadin.ControlStateMixin
     * @mixes Vaadin.ThemableMixin
     * @mixes Polymer.GestureEventListeners
     * @demo demo/index.html
     */
    class ButtonElement extends
      ElementMixin$1(
        ControlStateMixin(
          ThemableMixin(
            GestureEventListeners(PolymerElement)))) {
      static get template() {
        return html$1`
    <style>
      :host {
        display: inline-block;
        position: relative;
        outline: none;
        white-space: nowrap;
      }

      :host([hidden]) {
        display: none !important;
      }

      /* Ensure the button is always aligned on the baseline */
      .vaadin-button-container::before {
        content: "\\2003";
        display: inline-block;
        width: 0;
      }

      .vaadin-button-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
        min-height: inherit;
        text-shadow: inherit;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }

      [part="prefix"],
      [part="suffix"] {
        flex: none;
      }

      [part="label"] {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #button {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: inherit;
      }
    </style>
    <div class="vaadin-button-container">
      <div part="prefix">
        <slot name="prefix"></slot>
      </div>
      <div part="label">
        <slot></slot>
      </div>
      <div part="suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    <button id="button" type="button"></button>
`;
      }

      static get is() {
        return 'vaadin-button';
      }

      static get version() {
        return '2.1.0';
      }

      ready() {
        super.ready();

        // Leaving default role in the native button, makes navigation announcement
        // being different when using focus navigation (tab) versus using normal
        // navigation (arrows). The first way announces the label on a button
        // since the focus is moved programmatically, and the second on a group.
        this.setAttribute('role', 'button');
        this.$.button.setAttribute('role', 'presentation');

        this._addActiveListeners();
      }

      /**
       * @protected
       */
      disconnectedCallback() {
        super.disconnectedCallback();

        // `active` state is preserved when the element is disconnected between keydown and keyup events.
        // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
        if (this.hasAttribute('active')) {
          this.removeAttribute('active');
        }
      }

      _addActiveListeners() {
        addListener(this, 'down', () => !this.disabled && this.setAttribute('active', ''));
        addListener(this, 'up', () => this.removeAttribute('active'));
        this.addEventListener('keydown', e => !this.disabled && [13, 32].indexOf(e.keyCode) >= 0 && this.setAttribute('active', ''));
        this.addEventListener('keyup', () => this.removeAttribute('active'));
        this.addEventListener('blur', () => this.removeAttribute('active'));
      }

      /**
       * @protected
       */
      get focusElement() {
        return this.$.button;
      }
    }

    customElements.define(ButtonElement.is, ButtonElement);

    const $_documentContainer$e = document.createElement('template');

    $_documentContainer$e.innerHTML = `<dom-module id="lumo-text-field" theme-for="vaadin-text-field">
  <template>
    <style>
      :host {
        --lumo-text-field-size: var(--lumo-size-m);
        color: var(--lumo-body-text-color);
        font-size: var(--lumo-font-size-m);
        font-family: var(--lumo-font-family);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-tap-highlight-color: transparent;
        padding: var(--lumo-space-xs) 0;
      }

      :host::before {
        height: var(--lumo-text-field-size);
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
      }

      [part="label"] {
        align-self: flex-start;
        color: var(--lumo-secondary-text-color);
        font-weight: 500;
        font-size: var(--lumo-font-size-s);
        margin-left: calc(var(--lumo-border-radius) / 4);
        transition: color 0.2s;
        line-height: 1;
        padding-bottom: 0.5em;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        position: relative;
        max-width: 100%;
        box-sizing: border-box;
      }

      :host([has-label])::before {
        /* Label height + margin */
        margin-top: calc(var(--lumo-font-size-s) * 1.5);
      }

      :host([has-label]) {
        padding-top: var(--lumo-space-m);
      }

      :host([focused]:not([readonly])) [part="label"] {
        color: var(--lumo-primary-text-color);
      }

      :host([required]) [part="label"] {
        padding-right: 1em;
      }

      /* Used for required and invalid indicators */
      [part="label"]::after {
        content: var(--lumo-required-field-indicator, "•");
        transition: opacity 0.2s;
        opacity: 0;
        color: var(--lumo-primary-text-color);
        position: absolute;
        right: 0;
        width: 1em;
        text-align: center;
      }

      [part="value"],
      [part="input-field"] ::slotted([part="value"]) {
        cursor: inherit;
        min-height: var(--lumo-text-field-size);
        padding: 0 0.25em;
        --_lumo-text-field-overflow-mask-image: linear-gradient(to left, transparent, #000 1.25em);
        -webkit-mask-image: var(--_lumo-text-field-overflow-mask-image);
      }

      [part="value"]:focus {
        -webkit-mask-image: none;
        mask-image: none;
      }

      /*
        TODO: CSS custom property in \`mask-image\` causes crash in Edge
        see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15415089/
      */
      @-moz-document url-prefix() {
        [part="value"],
        [part="input-field"] ::slotted([part="value"]) {
          mask-image: var(--_lumo-text-field-overflow-mask-image);
        }
      }

      [part="value"]::-webkit-input-placeholder {
        color: inherit;
        transition: opacity 0.175s 0.05s;
        opacity: 0.5;
      }

      [part="value"]:-ms-input-placeholder {
        color: inherit;
        opacity: 0.5;
      }

      [part="value"]::-moz-placeholder {
        color: inherit;
        transition: opacity 0.175s 0.05s;
        opacity: 0.5;
      }

      [part="value"]::placeholder {
        color: inherit;
        transition: opacity 0.175s 0.1s;
        opacity: 0.5;
      }

      [part="input-field"] {
        border-radius: var(--lumo-border-radius);
        background-color: var(--lumo-contrast-10pct);
        padding: 0 calc(0.375em + var(--lumo-border-radius) / 4 - 1px);
        font-weight: 500;
        line-height: 1;
        position: relative;
        cursor: text;
        box-sizing: border-box;
      }

      /* Used for hover and activation effects */
      [part="input-field"]::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-radius: inherit;
        pointer-events: none;
        background-color: var(--lumo-contrast-50pct);
        opacity: 0;
        transition: transform 0.15s, opacity 0.2s;
        transform-origin: 100% 0;
      }

      /* Hover */

      :host(:hover:not([readonly]):not([focused])) [part="label"] {
        color: var(--lumo-body-text-color);
      }

      :host(:hover:not([readonly]):not([focused])) [part="input-field"]::after {
        opacity: 0.1;
      }

      /* Touch device adjustment */
      @media (pointer: coarse) {
        :host(:hover:not([readonly]):not([focused])) [part="label"] {
          color: var(--lumo-secondary-text-color);
        }

        :host(:hover:not([readonly]):not([focused])) [part="input-field"]::after {
          opacity: 0;
        }

        :host(:active:not([readonly]):not([focused])) [part="input-field"]::after {
          opacity: 0.2;
        }
      }

      /* Trigger when not focusing using the keyboard */
      :host([focused]:not([focus-ring]):not([readonly])) [part="input-field"]::after {
        transform: scaleX(0);
        transition-duration: 0.15s, 1s;
      }

      /* Focus-ring */

      :host([focus-ring]) [part="input-field"] {
        box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
      }

      /* Read-only and disabled */
      :host([readonly]) [part="value"]::-webkit-input-placeholder,
      :host([disabled]) [part="value"]::-webkit-input-placeholder {
        opacity: 0;
      }

      :host([readonly]) [part="value"]:-ms-input-placeholder,
      :host([disabled]) [part="value"]:-ms-input-placeholder {
        opacity: 0;
      }

      :host([readonly]) [part="value"]::-moz-placeholder,
      :host([disabled]) [part="value"]::-moz-placeholder {
        opacity: 0;
      }

      :host([readonly]) [part="value"]::placeholder,
      :host([disabled]) [part="value"]::placeholder {
        opacity: 0;
      }

      /* Read-only */

      :host([readonly]) [part="input-field"] {
        color: var(--lumo-secondary-text-color);
        background-color: transparent;
        cursor: default;
      }

      :host([readonly]) [part="input-field"]::after {
        background-color: transparent;
        opacity: 1;
        border: 1px dashed var(--lumo-contrast-30pct);
      }

      /* Disabled style */

      :host([disabled]) {
        pointer-events: none;
      }

      :host([disabled]) [part="input-field"] {
        background-color: var(--lumo-contrast-5pct);
      }

      :host([disabled]) [part="label"],
      :host([disabled]) [part="value"],
      :host([disabled]) [part="input-field"] ::slotted(*) {
        color: var(--lumo-disabled-text-color);
        -webkit-text-fill-color: var(--lumo-disabled-text-color);
      }

      /* Required field style */

      :host([required]:not([has-value])) [part="label"]::after {
        opacity: 1;
      }

      /* Invalid style */

      :host([invalid]) [part="label"]::after {
        color: var(--lumo-error-text-color);
      }

      :host([invalid]) [part="input-field"] {
        background-color: var(--lumo-error-color-10pct);
      }

      :host([invalid]) [part="input-field"]::after {
        background-color: var(--lumo-error-color-50pct);
      }

      :host([invalid][focus-ring]) [part="input-field"] {
        box-shadow: 0 0 0 2px var(--lumo-error-color-50pct);
      }

      /* Error message */

      [part="error-message"] {
        margin-left: calc(var(--lumo-border-radius) / 4);
        font-size: var(--lumo-font-size-xs);
        line-height: var(--lumo-line-height-xs);
        color: var(--lumo-error-text-color);
        will-change: max-height;
        transition: 0.4s max-height;
        max-height: 5em;
      }

      /* Margin that doesn’t reserve space when there’s no error message */
      [part="error-message"]:not(:empty)::before,
      [part="error-message"]:not(:empty)::after {
        content: "";
        display: block;
        height: 0.4em;
      }

      :host(:not([invalid])) [part="error-message"] {
        max-height: 0;
        overflow: hidden;
      }

      /* Small theme */

      :host([theme~="small"]) {
        font-size: var(--lumo-font-size-s);
        --lumo-text-field-size: var(--lumo-size-s);
      }

      :host([theme~="small"][has-label]) [part="label"] {
        font-size: var(--lumo-font-size-xs);
      }

      :host([theme~="small"][has-label]) [part="error-message"] {
        font-size: var(--lumo-font-size-xxs);
      }

      /* Text align */

      :host([theme~="align-center"]) [part="value"] {
        text-align: center;
        --_lumo-text-field-overflow-mask-image: none;
      }

      :host([theme~="align-right"]) [part="value"] {
        text-align: right;
        --_lumo-text-field-overflow-mask-image: none;
      }

      @-moz-document url-prefix() {
        /* Firefox is smart enough to align overflowing text to right */
        :host([theme~="align-right"]) [part="value"] {
          --_lumo-text-field-overflow-mask-image: linear-gradient(to right, transparent 0.25em, #000 1.5em);
        }
      }

      /* Slotted content */

      [part="input-field"] ::slotted(:not([part]):not(iron-icon)) {
        color: var(--lumo-secondary-text-color);
        font-weight: 400;
      }

      /* Slotted icons */

      [part="input-field"] ::slotted(iron-icon) {
        color: var(--lumo-contrast-60pct);
        width: var(--lumo-icon-size-m);
        height: var(--lumo-icon-size-m);
      }

      /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
      [part="input-field"] ::slotted(iron-icon[icon^="vaadin:"]) {
        padding: 0.25em;
        box-sizing: border-box !important;
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$e.content);

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    const $_documentContainer$f = document.createElement('template');

    $_documentContainer$f.innerHTML = `<dom-module id="vaadin-text-field-shared-styles">
  <template>
    <style>
      :host {
        display: inline-flex;
        outline: none;
      }

      :host::before {
        content: "\\2003";
        width: 0;
        display: inline-block;
        /* Size and position this element on the same vertical position as the input-field element
           to make vertical align for the host element work as expected */
      }

      :host([hidden]) {
        display: none !important;
      }

      .vaadin-text-field-container,
      .vaadin-text-area-container {
        display: flex;
        flex-direction: column;
        min-width: 100%;
        max-width: 100%;
        width: var(--vaadin-text-field-default-width, 12em);
      }

      [part="label"]:empty {
        display: none;
      }

      [part="input-field"] {
        display: flex;
        align-items: center;
        flex: auto;
      }

      /* Reset the native input styles */
      [part="value"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        outline: none;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        min-width: 0;
        font: inherit;
        font-size: 1em;
        line-height: normal;
        color: inherit;
        background-color: transparent;
        /* Disable default invalid style in Firefox */
        box-shadow: none;
      }

      [part="input-field"] ::slotted(*) {
        flex: none;
      }

      /* Slotted by vaadin-dropdown-menu-text-field */
      [part="value"],
      [part="input-field"] ::slotted([part="value"]) {
        flex: auto;
        white-space: nowrap;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }

      [part="value"]::-ms-clear {
        display: none;
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$f.content);

    /**
     * @polymerMixin
     * @mixes Vaadin.ControlStateMixin
     */
    const TextFieldMixin = subclass => class VaadinTextFieldMixin extends ControlStateMixin(subclass) {
      static get properties() {
        return {
          /**
           * Whether the value of the control can be automatically completed by the browser.
           * List of available options at:
           * https://developer.mozilla.org/en/docs/Web/HTML/Element/input#attr-autocomplete
           */
          autocomplete: {
            type: String
          },

          /**
           * This is a property supported by Safari that is used to control whether
           * autocorrection should be enabled when the user is entering/editing the text.
           * Possible values are:
           * on: Enable autocorrection.
           * off: Disable autocorrection.
           */
          autocorrect: {
            type: String
          },

          /**
           * This is a property supported by Safari and Chrome that is used to control whether
           * autocapitalization should be enabled when the user is entering/editing the text.
           * Possible values are:
           * characters: Characters capitalization.
           * words: Words capitalization.
           * sentences: Sentences capitalization.
           * none: No capitalization.
           */
          autocapitalize: {
            type: String
          },

          /**
           * Error to show when the input value is invalid.
           */
          errorMessage: {
            type: String,
            value: ''
          },

          /**
           * String used for the label element.
           */
          label: {
            type: String,
            value: '',
            observer: '_labelChanged'
          },

          /**
           * Maximum number of characters (in Unicode code points) that the user can enter.
           */
          maxlength: {
            type: Number
          },

          /**
           * Minimum number of characters (in Unicode code points) that the user can enter.
           */
          minlength: {
            type: Number
          },

          /**
           * The name of the control, which is submitted with the form data.
           */
          name: {
            type: String
          },

          /**
           * A hint to the user of what can be entered in the control.
           */
          placeholder: {
            type: String
          },

          /**
           * This attribute indicates that the user cannot modify the value of the control.
           */
          readonly: {
            type: Boolean,
            reflectToAttribute: true
          },

          /**
           * Specifies that the user must fill in a value.
           */
          required: {
            type: Boolean,
            reflectToAttribute: true
          },


          /**
           * The initial value of the control.
           * It can be used for two-way data binding.
           */
          value: {
            type: String,
            value: '',
            observer: '_valueChanged',
            notify: true
          },

          /**
           * This property is set to true when the control value is invalid.
           */
          invalid: {
            type: Boolean,
            reflectToAttribute: true,
            notify: true,
            value: false
          },

          /**
           * When set to true, user is prevented from typing a value that
           * conflicts with the given `pattern`.
           */
          preventInvalidInput: {
            type: Boolean
          },

          _labelId: {
            type: String
          },

          _errorId: {
            type: String
          }
        };
      }

      get focusElement() {
        return this.root.querySelector('[part=value]');
      }

      _onInput(e) {
        if (this.preventInvalidInput) {
          const input = this.focusElement;
          if (input.value.length > 0 && !this.checkValidity()) {
            input.value = this.value || '';
          }
        }
      }

      _onChange(e) {
        // In the Shadow DOM, the `change` event is not leaked into the
        // ancestor tree, so we must do this manually.
        const changeEvent = new CustomEvent('change', {
          detail: {
            sourceEvent: e
          },
          bubbles: e.bubbles,
          cancelable: e.cancelable,
        });
        this.dispatchEvent(changeEvent);
      }

      _valueChanged(newVal, oldVal) {
        // setting initial value to empty string, skip validation
        if (newVal === '' && oldVal === undefined) {
          return;
        }
        if (this.invalid) {
          this.validate();
        }
        if (newVal !== '' && newVal != null) {
          this.setAttribute('has-value', '');
        } else {
          this.removeAttribute('has-value');
        }
      }

      _labelChanged(label) {
        if (label !== '' && label != null) {
          this.setAttribute('has-label', '');
        } else {
          this.removeAttribute('has-label');
        }
      }

      /**
       * Returns true if the current input value satisfies all constraints (if any)
       * @returns {boolean}
       */
      checkValidity() {
        if (this.required || this.pattern || this.maxlength || this.minlength) {
          return this.focusElement.checkValidity();
        } else {
          return !this.invalid;
        }
      }


      ready() {
        super.ready();
        if (!(window.ShadyCSS && window.ShadyCSS.nativeCss)) {
          this.updateStyles();
        }

        var uniqueId = TextFieldMixin._uniqueId = 1 + TextFieldMixin._uniqueId || 0;
        this._errorId = `${this.constructor.is}-error-${uniqueId}`;
        this._labelId = `${this.constructor.is}-label-${uniqueId}`;

        if (navigator.userAgent.match(/Trident/)) {
          this._addIEListeners();
        }
      }

      /**
       * Returns true if `value` is valid.
       * `<iron-form>` uses this to check the validity or all its elements.
       *
       * @return {boolean} True if the value is valid.
       */
      validate() {
        return !(this.invalid = !this.checkValidity());
      }

      _addIEListeners() {
        // IE11 dispatches `input` event in following cases:
        // - focus or blur, when placeholder attribute is set
        // - placeholder attribute value changed
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/101220/
        const prevent = e => {
          e.stopImmediatePropagation();
          this.focusElement.removeEventListener('input', prevent);
        };
        const shouldPreventInput = () => this.placeholder && this.focusElement.addEventListener('input', prevent);
        this.focusElement.addEventListener('focusin', shouldPreventInput);
        this.focusElement.addEventListener('focusout', shouldPreventInput);
        this._createPropertyObserver('placeholder', shouldPreventInput);
      }

      _getActiveErrorId(invalid, errorMessage, errorId) {
        return errorMessage && invalid ? errorId : undefined;
      }

      _getActiveLabelId(label, labelId) {
        return label ? labelId : undefined;
      }

      _getErrorMessageAriaHidden(invalid, errorMessage, errorId) {
        return (!this._getActiveErrorId(invalid, errorMessage, errorId)).toString();
      }

      /**
       * @protected
       */
      attributeChangedCallback(prop, oldVal, newVal) {
        super.attributeChangedCallback(prop, oldVal, newVal);
        // Needed until Edge has CSS Custom Properties (present in Edge Preview)
        if (!(window.ShadyCSS && window.ShadyCSS.nativeCss) &&
          /^(focused|focus-ring|invalid|disabled|placeholder|has-value)$/.test(prop)) {
          this.updateStyles();
        }

        // Safari has an issue with repainting shadow root element styles when a host attribute changes.
        // Need this workaround (toggle any inline css property on and off) until the issue gets fixed.
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari && this.root) {
          const WEBKIT_PROPERTY = '-webkit-backface-visibility';
          this.root.querySelectorAll('*').forEach(el => {
            el.style[WEBKIT_PROPERTY] = 'visible';
            el.style[WEBKIT_PROPERTY] = '';
          });
        }
      }

      /**
       * Fired when the user commits a value change.
       *
       * @event change
       */
    };

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    /**
     * `<vaadin-text-field>` is a Web Component for text field control in forms.
     *
     * ```html
     * <vaadin-text-field label="First Name">
     * </vaadin-text-field>
     * ```
     *
     * ### Prefixes and suffixes
     *
     * These are child elements of a `<vaadin-text-field>` that are displayed
     * inline with the input, before or after.
     * In order for an element to be considered as a prefix, it must have the slot
     * attribute set to `prefix` (and similarly for `suffix`).
     *
     * ```html
     * <vaadin-text-field label="Email address">
     *   <div slot="prefix">Sent to:</div>
     *   <div slot="suffix">@vaadin.com</div>
     * </vaadin-text-area>
     * ```
     *
     * ### Styling
     *
     * The following custom properties are available for styling:
     *
     * Custom property | Description | Default
     * ----------------|-------------|-------------
     * `--vaadin-text-field-default-width` | Set the default width of the input field | `12em`
     *
     * The following shadow DOM parts are available for styling:
     *
     * Part name | Description
     * ----------------|----------------
     * `label` | The label element
     * `input-field` | The element that wraps prefix, value and suffix
     * `value` | The text value element inside the `input-field` element
     * `error-message` | The error message element
     *
     * The following state attributes are available for styling:
     *
     * Attribute    | Description | Part name
     * -------------|-------------|------------
     * `disabled` | Set to a disabled text field | :host
     * `has-value` | Set when the element has a value | :host
     * `has-label` | Set when the element has a label | :host
     * `invalid` | Set when the element is invalid | :host
     * `focused` | Set when the element is focused | :host
     * `focus-ring` | Set when the element is keyboard focused | :host
     * `readonly` | Set to a readonly text field | :host
     *
     * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
     *
     * @memberof Vaadin
     * @mixes Vaadin.TextFieldMixin
     * @mixes Vaadin.ThemableMixin
     * @demo demo/index.html
     */
    class TextFieldElement extends ElementMixin$1(TextFieldMixin(ThemableMixin(PolymerElement))) {
      static get template() {
        return html$1`
    <style include="vaadin-text-field-shared-styles">
      /* polymer-cli linter breaks with empty line */
    </style>

    <div class="vaadin-text-field-container">

      <label part="label" on-click="focus" id="[[_labelId]]">[[label]]</label>

      <div part="input-field">

        <slot name="prefix"></slot>

        <input part="value" autocomplete\$="[[autocomplete]]" autocorrect\$="[[autocorrect]]" autocapitalize\$="[[autocapitalize]]" autofocus\$="[[autofocus]]" disabled\$="[[disabled]]" list="[[list]]" maxlength\$="[[maxlength]]" minlength\$="[[minlength]]" pattern="[[pattern]]" placeholder\$="[[placeholder]]" readonly\$="[[readonly]]" aria-readonly\$="[[readonly]]" required\$="[[required]]" aria-required\$="[[required]]" value="{{value::input}}" title="[[title]]" on-blur="validate" on-input="_onInput" on-change="_onChange" aria-describedby\$="[[_getActiveErrorId(invalid, errorMessage, _errorId)]]" aria-labelledby\$="[[_getActiveLabelId(label, _labelId)]]" aria-invalid\$="[[invalid]]">

        <slot name="suffix"></slot>

      </div>

      <div part="error-message" id="[[_errorId]]" aria-live="assertive" aria-hidden\$="[[_getErrorMessageAriaHidden(invalid, errorMessage, _errorId)]]">[[errorMessage]]</div>

    </div>
`;
      }

      static get is() {
        return 'vaadin-text-field';
      }

      static get version() {
        return '2.1.2';
      }

      static get properties() {
        return {
          /**
           * Identifies a list of pre-defined options to suggest to the user.
           * The value must be the id of a <datalist> element in the same document.
           */
          list: {
            type: String
          },

          /**
           * A regular expression that the value is checked against.
           * The pattern must match the entire value, not just some subset.
           */
          pattern: {
            type: String
          },

          /**
           * Message to show to the user when validation fails.
           */
          title: {
            type: String
          }
        };
      }
    }

    customElements.define(TextFieldElement.is, TextFieldElement);

    const $_documentContainer$g = document.createElement('template');

    $_documentContainer$g.innerHTML = `<custom-style>
  <style>
    @font-face {
      font-family: 'lumo-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAA5cAAsAAAAAG6QAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAQwAAAFZAIUt8Y21hcAAAAYgAAADaAAADPhv48PpnbHlmAAACZAAACQAAABHwa97VJGhlYWQAAAtkAAAAMQAAADYQht82aGhlYQAAC5gAAAAdAAAAJAbpA3ZobXR4AAALuAAAABAAAACMhNAAAGxvY2EAAAvIAAAASAAAAEhM0FB8bWF4cAAADBAAAAAfAAAAIAFCAXBuYW1lAAAMMAAAATEAAAIuUUJZCHBvc3QAAA1kAAAA+AAAAYn12iK5eJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQ+zTiBgZWBgamKaQ8DA0MPhGZ8wGDIyAQUZWBlZsAKAtJcUxgcXjG+UmIO+p/FEMUcxDANKMwIkgMAA/UMHwB4nO3RWW7DIABF0UtMnMmZ5znhu8vqgvKVNXRtbCLl8bqMWjpcGWFkAdAHmuKriBDeBPS8ymyo8w3jOh/5rmui5nP6fMoYNJb3WMdeWRvLji0DhozKdxM6psyYs2DJijUbtuzYc+DIiTMXrty48+BJKpu0/D+dhvDz95Z0zlZPvmeojekGczTdRe6bbje3hjow1KGhjgx1bLr1PDHUzvR3eWqoM0OdG+rCUJeGujLUtaFuDHVrqDtD3RvqwVCPhnoy1LOhXgz1aqg3Q70b6sNQn4aajPQLy1RQ8AAAeJy1V31sW1cVv+cm9vP78kfs956dxLHznDwnTmOrz47dJG3SxGFLl6QfWprRDdpULZMqilpW0DRQ9kdKqwJdVw3BPyAqhNQiMdTRSoitKhOisLEP/ijSWFGFJtBAY2iCNRKoWh6ce5/txJ7bbppIrKN77zn3vHPOPff8ziVA8K8lBjdJkBCw/KAnQLfHYQyyEADo8PfGqH9FNdXbfhrr9d+EVxXa2aO+Jctvqz2dVHkVt3Md9PP0m0xHr+4HKwdWgenoQh10j0I7epW3FOVtpbcDd5z297g6FdQZRZ2kpuOqqwOsMW5HJAB+tGMc4OkGHXTc3xutKYn1cCUVX6iH2+HNQnEcinYCrfBDrokvf1intJOqr6zZ8QbdSgzUUSp2gTcAXjOHZoxBAkKFoq1rtH1JTmhUuSLHpSsK1RLykp7UXzsqUSMhn5ek83LCoNJR2B7Q9UBV599dnWA0Bqjb1iPeFDx+RF6/XT4Cc0FdD8Kmxm89qSX1Bp3dplUo5rvT9XEr0S86l7mOuQbdsElPak+6eqW47Oqt+X6I6wz5wbSGQkJ9HNO0HfD7Sw174Z/VLzUEgan08nM5TJ8lAZIgOTJOdpB9hITzth6HiHcAv7MFCkXD9OJUHwW7iFMrxfhayOUPhTjfCHk5H6dWyvgwH6dr/IuHtXhcY6QoiKKQESRJuLZuTQKQmqyyNRSHvXHtHbaMpCwKFxjjgiDC2bi2+gpbp0UtPikJjsI4sCJIB7sizlHGgbORrjJyLnPOnMCC0MJjEMUYxEmGDGFupUKFMcinhlhGxSFld4EWwjUL3fFqLew4eV7g0Rp5rRolODIzOJuFmBmD7OzgzJA1bw2dw7B/wILvtAb1vy6F1TE1fBEo8jOhaDSUGZwbdBygVrFoOTcwIxO6Xkoq4TY1iSZp3K4S2pUieVImD5ID5Bg5Tr5Ffkguk1+R35O/kFvQAmFIQR7K8CAcwNzIo9UYZ7S7cobMTHaGo1DhaELD6brid57/v+VLjdl2j3njfs/H/N7HtadxDo/fVsR+UXmAneHqa4w+wBeeyYiK6mPkRJPR+5+AuzZqRta4TuQjqrm7QrocERVFjMRCbp6GYnx+hXt5R7L0idi3m0o23XQPTR9dewWXInTAxTbTG2EYW4JiwTIFgDE5ocunZCyiZVlPys4N+JysJ3BFhknGct6s4dJ7cImoHJewvnVXFFHtuuCXnM2SX7iu9l17SWhT1TbhJbWyZ5ruYXsQd9y6aCKeReDhmhhsYdvhmrt9DQO/Sz/N9wlet7zaDFjomXvuew/x1/2eWxYKDDzqbYT/rBlZq42THB96yMbKXsRcK82ro9Zipq20VSgVS0Xb0JEpeAVv2h6DQhZMP0S6gLbvZjHbpwACsfXI3OyGwcENs3M/qw4emX5ievqJs4zAod0sqvvk0DUGz6u36gT5YKoiioS7VLMvTQpoHRpTSguI4Sm0Iy0Y2CFoaJZglBB882ilUUojZHrMLGCJx8Ie8UPLxK6gumF0ut8Mz4dtbXo8pwbn54NqbnS23wzgUmx6dEPUs8u5nNuVy+3aywicarNj20Y3xjy7d4TUgfFPabY+H7Njk1xyV0jZMDrZb8ZOVMSRVM/g1zRHOril/NwwbKwnqESVHWihBFfPyEZSeeopJWnIZ9aNYe+HltxxLQ5XsT8YRO136I7CLqKtgQKbdTfvmW4yNAqsPsdhibbCtqY9VHD1A3ZUn6mRYsXPd+HN5n3rFoV963fYn1xn31Keh99KYCSlq6L4S94B/biWd2X6EyKTMLFZ3rHEysLQxmIpXHK7s7SQcvsKxGPsS0ohPEx0DIU4ftMfjL3uv596WzT/vwqy2Q5y/pnyn3kXsF2Lz5jDpnMJCf7o8KZ3AlFA0fsD0DaqUCOljjw0E9ecS0z8+XnnlisI25Ew01preRch3XgvJvDm3/Mm8K5JqHRF6ULR7bL0Cq5YRVi56+3IZ0RZ9nlMj09WFNOngOrjNHTXWwI3FN8Nj8/nueFTnGuqr5uVvm6fWvXh21iDoqSI/cVsxYcsg7yKF3hBvMyPXp25ZJc4o2Sl+b8pcJ6g112ntM2Kpzeiw0p57r6tY3NzY1vvmzu5NnS+kMxumSgvlye2ZJOS1yvVT+HhvnI6Xd7JSF88kxnJZA52RPv7FrYu9PVHO9YN/9bTPWBEo8ZAd48kilLd7OsVDUhmmIqRDPFU/P0R6STDZJLMkIdYvdbz9W6Vqj6nzFoo8rYhWKmavywWeHV1jSUchmyIpZttiMAuswDsEsPpzbo+sc5FRbZHt3H/yxv/URuVRo16KeXmOUC/hW9wKjgv0J1ie5u4+hzSY5tb1jnrE/Lp+XEeiMXqIFAv4es/JwgYza9xCs4iKmtrR2VSuH2ttu8hCokRC7v+9Z2tdsfJhWiITvPW5+eMNh/TbFs0mopGXwzFsCOOvRjiswreynAS7zUBliXs7iJigidoGEH4E6cnjKSBPxe3/vsufZ9eIv28qvHA6172iEqwutKFL9AiXxJYuWOPtxy7SX0Z1ZRb6IjPFxBU2ROJb+2X4ooQMH0johhobS1k95r2VwtRfwdd7pWp2tJ6MNAttgod/sk9U4OSR/D4xMABFKc0FDR6CsvPbs99lqyv4QxHPVX8NTyIvz913pA6I5FOCTJhmLzokX3wFZ/suagkq+9fmX6Z1/4Uc3wUtIjO6laeBWAAu3O8NRq8/jILwcvofm3A41G/XMN07F3+yCv+UKUNYEUfq4lbcbD6uDDNE3etQMGKqLSeEMUTrYo4sn94eP+X9g9jyUdQmih/rzxh9fXhgB5aFMTW02KHeLpVFJZHmNDw/hH2nNmOMumacA2HLbrM6yHpxfLHHvZ4h6qVQYsIdV3Bd44rUVM9PrFz6rGpqcdOHSvfzi/k8wuPLtj2wr+PK6koqMez5WOnGHdq5+EK59GFvPst7GWqWIfvzGav4eZYB79BNFtSEhEqI9y5T2RlsQJ1QQ51Hlpe9zaPJqTzknhBSkSp7PyiEeto5e3I7lCEZfS6Qlh1HFY4eEwx4ryw4+T3T+6AvZU5Eufm8OKmTYvD/wOh6LtFeJxjYGRgYABirdgDi+L5bb4ycDO/AIowXHvpewxB/3/NPJXpFpDLwcAEEgUAcVcNjQAAAHicY2BkYGAO+p8FJF8wAAHzVAZGBlSgDABW7gNnAAAAeJxjYGBgYH4xODAAavgfNwAAAAAAIgBEAGYAiACyANwBBgEyAbQCAAOyA9QD7gQKBCYEQgSSBOgFFgVcBX4FzgYwBqgHMAdqB4IHygfmCBAIVgiMCNII+HicY2BkYGBQZkxhEGUAASYg5gJCBob/YD4DABe8AbQAeJxtkT1OwzAYht/0D9FKCARiYfECC2r6M3ZkaPcO3dPUaVM5ceS4Fb0DJ+AQHIKBM3AIDsFb80mVUG3J3+PH7xcrCYBrfCHCcUTohvU4Grjg7o+bpBvhFvlBuI0eHoU79EPhLp4xEe7hFppPiFqXNHd4FW7gCm/CTfp34Rb5Q7iNe3wKd+i/hbtY4Ee4h6foxewK289TW9Zzvd6ZxJ3EiRba1bkt1SgenuRMl9olXq/U8qDq/XrsfaYyZws1taXXxlhVObvVqY833leTwSATH6e2gMEOBSz6yJGylqgx5/uu6Q0SuLOJc27BLseah73CCDG/57nkjMkypBN41hXTSxy41tjz5jGtR8Z9xoxlv8I09B7ThtPSVOFsS5PSx9iEror/bcCZ/cvH4fbiFyPgZJwAAAB4nG2O2W7CMBBFc8nSEKD7vrf0lY8y9pREcWxrHBfx981GnzqSR+dId64czaJxiuj/WWOGGAlSZDhBjjkKLLDECqc4wzkucIkrXOMGt7jDPR7wiCc84wWveMM7PvCJNb6iQpidpo2yezOhpu92MSJXu7LNRw6uEMx2P0UHHKMDTtGBg5tvBW9kKbhNtqR1LoUmowTPZUmybgTXy45+2Jqh7k/6wtVRhsriaMGlUltZx9LuUsnW+7w/1VaoXLF1vSSkqjal7hMc04GW3duoyoutJpU0ZELaVCb41JXWUOK0OHQr+Iypr8k8CZZlFlxvSfDEUfQLbphqXQ==) format('woff');
      font-weight: normal;
      font-style: normal;
    }

    html {
      --lumo-icons-angle-down: "\\ea01";
      --lumo-icons-angle-left: "\\ea02";
      --lumo-icons-angle-right: "\\ea03";
      --lumo-icons-angle-up: "\\ea04";
      --lumo-icons-arrow-down: "\\ea05";
      --lumo-icons-arrow-left: "\\ea06";
      --lumo-icons-arrow-right: "\\ea07";
      --lumo-icons-arrow-up: "\\ea08";
      --lumo-icons-bar-chart: "\\ea09";
      --lumo-icons-bell: "\\ea0a";
      --lumo-icons-calendar: "\\ea0b";
      --lumo-icons-checkmark: "\\ea0c";
      --lumo-icons-chevron-down: "\\ea0d";
      --lumo-icons-chevron-left: "\\ea0e";
      --lumo-icons-chevron-right: "\\ea0f";
      --lumo-icons-chevron-up: "\\ea10";
      --lumo-icons-clock: "\\ea11";
      --lumo-icons-cog: "\\ea12";
      --lumo-icons-cross: "\\ea13";
      --lumo-icons-download: "\\ea14";
      --lumo-icons-dropdown: "\\ea15";
      --lumo-icons-edit: "\\ea16";
      --lumo-icons-error: "\\ea17";
      --lumo-icons-eye: "\\ea18";
      --lumo-icons-eye-disabled: "\\ea19";
      --lumo-icons-menu: "\\ea1a";
      --lumo-icons-minus: "\\ea1b";
      --lumo-icons-phone: "\\ea1c";
      --lumo-icons-play: "\\ea1d";
      --lumo-icons-plus: "\\ea1e";
      --lumo-icons-reload: "\\ea1f";
      --lumo-icons-search: "\\ea20";
      --lumo-icons-upload: "\\ea21";
      --lumo-icons-user: "\\ea22";
    }
  </style>
</custom-style>`;

    document.head.appendChild($_documentContainer$g.content);

    const $_documentContainer$h = document.createElement('template');

    $_documentContainer$h.innerHTML = `<dom-module id="lumo-field-button">
  <template>
    <style>
      [part\$="button"] {
        flex: none;
        width: 1em;
        height: 1em;
        line-height: 1;
        font-size: var(--lumo-icon-size-m);
        text-align: center;
        color: var(--lumo-contrast-60pct);
        transition: 0.2s color;
        cursor: default;
      }

      :host(:not([readonly])) [part\$="button"]:hover {
        color: var(--lumo-contrast-90pct);
      }

      :host([disabled]) [part\$="button"],
      :host([readonly]) [part\$="button"] {
        color: var(--lumo-contrast-20pct);
      }

      [part\$="button"]::before {
        font-family: "lumo-icons";
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$h.content);

    const $_documentContainer$i = document.createElement('template');

    $_documentContainer$i.innerHTML = `<dom-module id="lumo-password-field" theme-for="vaadin-password-field">
  <template>
    <style include="lumo-field-button">
      [part="reveal-button"]::before {
        content: var(--lumo-icons-eye);
      }

      :host([password-visible]) [part="reveal-button"]::before {
        content: var(--lumo-icons-eye-disabled);
      }

      /* Make it easy to hide the button across the whole app */
      [part="reveal-button"] {
        display: var(--lumo-password-field-reveal-button-display, block);
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$i.content);

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    const $_documentContainer$j = document.createElement('template');

    $_documentContainer$j.innerHTML = `<custom-style>
  <style>
    @font-face {
      font-family: 'vaadin-password-field-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAYMAAsAAAAABcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIFgGNtYXAAAAFoAAAAVAAAAFQXVtKIZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAAfwAAAH8yBLEP2hlYWQAAAPAAAAANgAAADYN+RfTaGhlYQAAA/gAAAAkAAAAJAfCA8dobXR4AAAEHAAAABgAAAAYDgAAAGxvY2EAAAQ0AAAADgAAAA4BJgCSbWF4cAAABEQAAAAgAAAAIAAMAFpuYW1lAAAEZAAAAYYAAAGGmUoJ+3Bvc3QAAAXsAAAAIAAAACAAAwAAAAMDVQGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6QEDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkB//3//wAAAAAAIOkA//3//wAB/+MXBAADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAwAAAHoEAALGABQAJABFAAABIg4CMTAeAjMyPgIxMC4CIwc+ATEwBhUUFjEHMCY1NDYTIi4CJz4BNw4BFRQeAjMyPgI1NCYnHgEXDgMjAgChyHAnN3rAiYjFfjsncMihrRg7IA1GExmnY5ZqQg8PWGAFCChGXTU1XUYoCAVgWA8RRW2ZZALGZnpmUmJSUGBQaHxoYA8FRSIhJQ0rIiYz/lQvQkYVInswEygYNV1GKChGXTUYKBMrgCIVRkIvAAAABQAA/8AEAAPAABoAJgA6AEcAVwAAAQceARcOAyMiJicHHgEzMj4CMTAuAicHNCYnATIWMzI+AhMBLgEjIg4CMTAeAhcHFTMBNQEuASc+ATcOARUUFhc3BzAmNTQ2MT4BMTAGFQYWAzo0UlMPEUVtmWQiNR0zJ1QsiMV+OxEsTTw6AgT+zA8dDjVdRijT/ucnXjWhyHAnGTNQN9MtA9P9AE1ZFA9YYAUILSY6QBMZGDsgBAsCczMrcyIWQ0AtCAQzDgtQYFAzS1ckeQ4bCv7TBihGXQH7/uYKEGZ6Zic5RBzNLQPTLf0tIVoYInswEygYNWMihgwrISc5DwVHJiIlAAEAAAAAAADkyo21Xw889QALBAAAAAAA1W1pqwAAAADVbWmrAAD/wAQAA8AAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAABAAAAQAAAAAAAAAAAAAAAAAAAAYEAAAAAAAAAAAAAAACAAAABAAAAAQAAAAAAAAAAAoAFAAeAH4A/gAAAAEAAAAGAFgABQAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAOAK4AAQAAAAAAAQAHAAAAAQAAAAAAAgAHAGAAAQAAAAAAAwAHADYAAQAAAAAABAAHAHUAAQAAAAAABQALABUAAQAAAAAABgAHAEsAAQAAAAAACgAaAIoAAwABBAkAAQAOAAcAAwABBAkAAgAOAGcAAwABBAkAAwAOAD0AAwABBAkABAAOAHwAAwABBAkABQAWACAAAwABBAkABgAOAFIAAwABBAkACgA0AKRpY29tb29uAGkAYwBvAG0AbwBvAG5WZXJzaW9uIDEuMABWAGUAcgBzAGkAbwBuACAAMQAuADBpY29tb29uAGkAYwBvAG0AbwBvAG5pY29tb29uAGkAYwBvAG0AbwBvAG5SZWd1bGFyAFIAZQBnAHUAbABhAHJpY29tb29uAGkAYwBvAG0AbwBvAG5Gb250IGdlbmVyYXRlZCBieSBJY29Nb29uLgBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('woff');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</custom-style><dom-module id="vaadin-password-field-template">
  <template>
    <style>
      /* Hide the native eye icon for IE/Edge */
      ::-ms-reveal {
        display: none;
      }

      [part="reveal-button"][hidden] {
        display: none !important;
      }
    </style>

    <div part="reveal-button" on-mousedown="_revealButtonMouseDown" on-touchend="_togglePasswordVisibilityTouchend" on-click="_togglePasswordVisibility" hidden\$="[[revealButtonHidden]]">
    </div>
  </template>
  
</dom-module>`;

    document.head.appendChild($_documentContainer$j.content);
    let memoizedTemplate;

    /**
     * `<vaadin-password-field>` is a Web Component for password field control in forms.
     *
     * ```html
     * <vaadin-password-field label="Password">
     * </vaadin-password-field>
     * ```
     *
     * ### Styling
     *
     * See vaadin-text-field.html for the styling documentation
     *
     * In addition to vaadin-text-field parts, here's the list of vaadin-password-field specific parts
     *
     * Part name       | Description
     * ----------------|----------------------------------------------------
     * `reveal-button` | The eye icon which toggles the password visibility
     *
     * In addition to vaadin-text-field state attributes, here's the list of vaadin-password-field specific attributes
     *
     * Attribute    | Description | Part name
     * -------------|-------------|------------
     * `password-visible` | Set when the password is visible | :host
     *
     * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
     *
     * @memberof Vaadin
     * @extends Vaadin.TextFieldElement
     * @demo demo/index.html
     */
    class PasswordFieldElement extends TextFieldElement {
      static get is() {
        return 'vaadin-password-field';
      }

      static get version() {
        return '2.1.2';
      }

      static get properties() {
        return {
          /**
           * Set to true to hide the eye icon which toggles the password visibility.
           */
          revealButtonHidden: {
            type: Boolean,
            value: false
          },

          /**
           * True if the password is visible ([type=text]).
           */
          passwordVisible: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
            observer: '_passwordVisibleChange',
            readOnly: true
          }
        };
      }

      static get template() {
        if (!memoizedTemplate) {
          // Clone the superclass template
          memoizedTemplate = super.template.cloneNode(true);

          // Retrieve this element's dom-module template
          const thisTemplate = DomModule.import(this.is + '-template', 'template');
          const revealButton = thisTemplate.content.querySelector('[part="reveal-button"]');
          const styles = thisTemplate.content.querySelector('style');

          // Append reveal-button and styles to the text-field template
          const inputField = memoizedTemplate.content.querySelector('[part="input-field"]');
          inputField.appendChild(revealButton);
          memoizedTemplate.content.appendChild(styles);
        }

        return memoizedTemplate;
      }

      ready() {
        super.ready();
        this.focusElement.type = 'password';
        this.focusElement.autocapitalize = 'off';

        this.addEventListener('blur', () => {
          if (!this._passwordVisibilityChanging) {
            this._setPasswordVisible(false);
            if (this._cachedChangeEvent) {
              this._onChange(this._cachedChangeEvent);
            }
          }
        });
      }

      _onChange(e) {
        if (this._passwordVisibilityChanging) {
          this._cachedChangeEvent = e;
        } else {
          this._cachedChangeEvent = null;
          super._onChange(e);
        }
      }

      _revealButtonMouseDown(e) {
        if (this.hasAttribute('focused')) {
          e.preventDefault();
        }
      }

      _togglePasswordVisibilityTouchend(e) {
        // Cancel the following click event
        e.preventDefault();
        this._togglePasswordVisibility();
        this.focusElement.focus();
      }

      _togglePasswordVisibility() {
        this._passwordVisibilityChanging = true;
        this.focusElement.blur();
        this._setPasswordVisible(!this.passwordVisible);
        this.focusElement.focus();
        this._passwordVisibilityChanging = false;
      }

      _passwordVisibleChange(passwordVisible) {
        this.focusElement.type = passwordVisible ? 'text' : 'password';
      }
    }

    customElements.define(PasswordFieldElement.is, PasswordFieldElement);

    const $_documentContainer$k = document.createElement('template');

    $_documentContainer$k.innerHTML = `<dom-module id="whcg-text-field-styles" theme-for="vaadin-text-field">
  <template>
    <style>

    :host::before {
      font-size: var(--whcg-host-before-font-size);
      height: var(--whcg-host-before-height);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
    }
    
    :host {        
      font-size: var(--whcg-host-font-size);
      padding-top: var(--whcg-host-padding-top);
      padding-bottom: var(--whcg-host-padding-bottom);
      padding-left: var(--whcg-host-padding-left);
      padding-right: var(--whcg-host-padding-right);
      box-sizing: border-box;
    }

    :host([has-label]) {
      padding-top: var(--whcg-host-haslabel-padding-top);
      padding-bottom: var(--whcg-host-haslabel-padding-bottom);
      padding-left: var(--whcg-host-haslabel-padding-left);
      padding-right: var(--whcg-host-haslabel-padding-right);
    }

    [part="label"] {
      font-weight: var(--whcg-label-font-weight);
      font-size: var(--whcg-label-font-size);
      font-family: var(--whcg-label-font-family);
      line-height: 1;
      color: var(--whcg-label-color);
      align-self: flex-start;
      padding-top: var(--whcg-label-padding-top);
      padding-bottom: var(--whcg-label-padding-bottom);
      padding-right: var(--whcg-label-padding-right);
      padding-left: var(--whcg-label-padding-left);

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      position: relative;
      max-width: 100%;
      box-sizing: border-box;
    }

    :host(.dark) [part="label"] {
      color: var(--whcg-label-host__dark-color);
    }

    :host([focused]:not([readonly])) [part="label"] {
      color: var(--whcg-label-host-focused-not-readonly-color);
    }

    :host(:hover:not([focused])) [part="label"] {
      color: var(--whcg-label-host-hover-not-focused-color);
    }

    :host([focused]) [part="label"] {
      color: var(--whcg-label-host-focused-color);
    }

    [part="input-field"] {
      font-size: var(--whcg-input-field-font-size);
      font-weight: var(--whcg-input-field-font-weight);
      font-family: var(--whcg-input-field-font-family);
      line-height: 1;
      
      background-color: var(--whcg-input-field-background-color);
      border-radius: var(--whcg-input-field-border-radius);
      border-style: var(--whcg-input-field-border-style);
      border-width: var(--whcg-input-field-border-width);
      border-color: var(--whcg-input-field-border-color);
      padding-top: var(--whcg-input-field-padding-top);
      padding-bottom: var(--whcg-input-field-padding-bottom);
      padding-left: var(--whcg-input-field-padding-left);
      padding-right: var(--whcg-input-field-padding-right);

      position: relative;
      cursor: text;
      box-sizing: border-box;
    }

    :host(.dark) [part="input-field"] {
      background-color: var(--whcg-input-field-host__dark-background-color);
    }
    :host(.shadow) [part="input-field"] {
      box-shadow: var(--whcg-input-field-host__shadow-box-shadow);
    }


    [part="value"] {
      cursor: inherit;
      color: var(--whcg-value-color);
      min-height: var(--whcg-value-min-height);
      padding: 0 0.25em;
    }

    :host(.dark) [part="value"] {
      color: var(--whcg-value-host__dark-color);
    }


    [part="value"]::placeholder {
      color: var(--whcg-value-placeholder-color);;
    }



  </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$k.content);

    class WhcgTextField extends PolymerElement {
        static get template() {
            return html$1 `
        <style>
        vaadin-text-field {
                --whcg-host-before-font-size: var(--whcg-text-field-host-before-font-size);
                --whcg-host-before-height: var(--whcg-text-field-host-before-height);

                --whcg-host-padding-top: var(--whcg-text-field-host-padding-top);
                --whcg-host-padding-bottom: var(--whcg-text-field-host-padding-bottom);
                --whcg-host-padding-left: var(--whcg-text-field-host-padding-left);
                --whcg-host-padding-right: var(--whcg-text-field-host-padding-right);
                --whcg-host-haslabel-padding-top: var(--whcg-text-field-host-haslabel-padding-top);
                --whcg-host-haslabel-padding-bottom: var(--whcg-text-field-host-haslabel-padding-bottom);
                --whcg-host-haslabel-padding-left: var(--whcg-text-field-host-haslabel-padding-left);
                --whcg-host-haslabel-padding-right: var(--whcg-text-field-host-haslabel-padding-right);

                --whcg-label-font-size: var(--whcg-text-field-label-font-size);
                --whcg-label-font-weight: var(--whcg-text-field-label-font-weight);
                --whcg-label-font-family: var(--whcg-text-field-label-font-family);

                --whcg-label-color: var(--whcg-text-field-label-color);
                --whcg-label-host-focused-color: var(--whcg-text-field-label-host-focused-color);
                --whcg-label-host-hover-not-focused-color: var(--whcg-text-field-label-host-hover-not-focused-color);
                --whcg-label-host__dark-color: var(--whcg-text-field-label-host__dark-color);

                --whcg-label-padding-top: var(--whcg-text-field-label-padding-top);
                --whcg-label-padding-bottom: var(--whcg-text-field-label-padding-bottom);
                --whcg-label-padding-left: var(--whcg-text-field-label-padding-left);
                --whcg-label-padding-right: var(--whcg-text-field-label-padding-right);

                --whcg-input-field-font-family: var(--whcg-text-field-input-field-font-family);
                --whcg-input-field-font-size: var(--whcg-text-field-input-field-font-size);
                --whcg-input-field-font-weight: var(--whcg-text-field-input-field-font-weight);
                --whcg-input-field-background-color: var(--whcg-text-field-input-field-background-color);
                --whcg-input-field-host__dark-background-color: var(--whcg-text-field-input-field-host__dark-background-color);

                --whcg-input-field-host__shadow-box-shadow: var(--whcg-text-field-input-field-host__shadow-box-shadow);
                
                --whcg-input-field-border-radius: var(--whcg-text-field-input-field-border-radius);
                --whcg-input-field-border-style: var(--whcg-text-field-input-field-border-style);
                --whcg-input-field-border-width: var(--whcg-text-field-input-field-border-width);
                --whcg-input-field-border-color: var(--whcg-text-field-input-field-border-color);
                --whcg-input-field-padding-top: var(--whcg-text-field-input-field-padding-top);
                --whcg-input-field-padding-bottom: var(--whcg-text-field-input-field-padding-bottom);
                --whcg-input-field-padding-left: var(--whcg-text-field-input-field-padding-left);
                --whcg-input-field-padding-right: var(--whcg-text-field-input-field-padding-right);
              
                --whcg-value-color: var(--whcg-text-field-value-color);
                --whcg-value-placeholder-color: var(--whcg-text-field-value-placeholder-color);
                --whcg-value-host__dark-color: var(--whcg-text-field-value-host__dark-color);
                --whcg-value-min-height: var(--whcg-text-field-value-min-height);  

             }
            
        </style>
      
    <vaadin-text-field value="{{value}}" label="{{label}}" placeholder="{{placeholder}}">
    </vaadin-text-field>
    `;
        }

        static get properties() {

            return {

                label: {
                    type: String,
                    notify: true,
                    readOnly: false,
                },
                value: {
                    type: String,
                    notify: true,
                    readOnly: false,
                    observer: '_valueChanged'
                },
                placeholder: {
                    type: String,
                    notify: true,
                    readOnly: false,
                },
                suffix: {
                    type: String,
                    notify: true,
                    readOnly: false,
                },
                kind: {
                    type: String,
                    notify: true,
                    readOnly: false,
                },
                period: {
                    type: String,
                    notify: true,
                    readOnly: false,
                },
                valueoutput: {
                    type: String,
                    notify: true,
                    readOnly: false,
                }
            }
        }

        _valueChanged() {
            // console.log('new value');
            // console.log(this.value);
            this.valueoutput = this.value;
        }

        connectedCallback() {
            super.connectedCallback();
            let event = new CustomEvent('childrenattached', {bubbles: true, composed: true});
            // console.log('dispatchingEvent!!');
            this.dispatchEvent(event);
        }
    }

    window.customElements.define('whcg-text-field', WhcgTextField);

    const $_documentContainer$l = document.createElement('template');

    $_documentContainer$l.innerHTML = `<dom-module id="whcg-button-styles" theme-for="vaadin-button">
  <template>
    <style>
    :host {
      font-size: var(--whcg-host-font-size);
      min-width: var(--whcg-host-min-width);
      height: var(--whcg-host-height);
      padding-top: var(--whcg-host-padding-top);
      padding-bottom: var(--whcg-host-padding-bottom);
      padding-left: var(--whcg-host-padding-left);
      padding-right: var(--whcg-host-padding-right);
      box-sizing: border-box;
      background-color: var(--whcg-host-background-color);
      border-radius: var(--whcg-host-border-radius);
      border-style: var(--whcg-host-border-style);
      border-width: var(--whcg-host-border-width);
      border-color: var(--whcg-host-border-color);
      cursor: default;
    }
    
    [part="label"] {
      font-size: var(--whcg-label-font-size);
      font-family: var(--whcg-label-font-family);
      font-weight: var(--whcg-label-font-weight);
      line-height: var(--whcg-label-line-height);
      color: var(--whcg-label-color);
      padding-top: var(--whcg-label-padding-top);
      padding-bottom: var(--whcg-label-padding-bottom);
      padding-left: var(--whcg-label-padding-left);
      padding-right: var(--whcg-label-padding-right);
    }

  </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$l.content);

    class WhcgButton extends PolymerElement {
        static get template() {
            return html$1`

        <style>
             vaadin-button {
                --whcg-host-font-size: var(--whcg-button-host-font-size);
                --whcg-host-background-color: var(--whcg-button-host-background-color);
                --whcg-host-border-radius: var(--whcg-button-host-border-radius);
                --whcg-host-border-style: var(--whcg-button-host-border-style);
                --whcg-host-border-width: var(--whcg-button-host-border-width);
                --whcg-host-border-color: var(--whcg-button-host-border-color);
                --whcg-host-height: var(--whcg-button-host-height);
                --whcg-host-min-width: var(--whcg-button-host-min-width);
                --whcg-host-padding-top: var(--whcg-button-host-padding-top);
                --whcg-host-padding-bottom: var(--whcg-button-host-padding-bottom);
                --whcg-host-padding-left: var(--whcg-button-host-padding-left);
                --whcg-host-padding-right: var(--whcg-button-host-padding-right);
                
                --whcg-label-font-size: var(--whcg-button-label-font-size);
                --whcg-label-font-weight: var(--whcg-button-label-font-weight);
                --whcg-label-font-family: var(--whcg-button-label-font-family);
                --whcg-label-line-height: var(--whcg-button-label-line-height); 
                --whcg-label-padding-top: var(--whcg-button-label-padding-top);
                --whcg-label-padding-bottom: var(--whcg-button-label-padding-bottom);
                --whcg-label-padding-left: var(--whcg-button-label-padding-left);
                --whcg-label-padding-right: var(--whcg-button-label-padding-right);
                --whcg-label-color: var(--whcg-button-label-color);
             }
        </style>

        <vaadin-button>
            <slot></slot>
        </vaadin-button>

    `;
        }

        static get properties() {

            return {

            }
        }

        

        

    }

    window.customElements.define('whcg-button', WhcgButton);

    const usermixin = (element) => {
        return class UserMixedin extends element {
            static get properties() {
                return {
                    user: {type: Object}
                };
            }

            constructor() {
                super();
                this.user = firebase.auth();
            }
        } 
    };

    const theuser = firebase.auth();

    class XLogin extends usermixin(LitElement) {
        firstUpdated() {
            this.user.onAuthStateChanged(function(user) {
                if (user) {      
                    console.log('User Logged In');
                    Router.go('/user');
                } else {
                    console.log('User Logged Out');
                    Router.go('/');
                }
            });
        }

        render() {
            return html`
        <whcg-text-field id="name" placeholder="email..."></whcg-text-field>
        <whcg-text-field id="password" placeholder="password..."></whcg-text-field>
        <whcg-button @click=${this.onClick.bind(this)}>LOGIN</whcg-button>
        `
        }



        onClick(e) {
            let email = this.shadowRoot.querySelector('#name').value;
            let password = this.shadowRoot.querySelector('#password').value;
            this.user.signInWithEmailAndPassword(email, password).catch(function(error) {
                console.log('Login Error');
            });
        }
    }

    customElements.define('x-login', XLogin);

    class XUser extends LitElement {
        render() {
            return html`
        <style>
            .bg {
                background-color: orange;
                width: 80vw;
                height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
        <div class="bg">
            <vaadin-button @click=${this.onClick.bind(this)}>LOGOUT</vaadin-button>
            <vaadin-button @click=${this.onGreen.bind(this)}>GREEN</vaadin-button>
        </div>
        `
        }

        onClick(e) {
            firebase.auth().signOut().then(function() {
                console.log('Sign-out successful');
              }).catch(function(error) {
                console.log('Error Signing Out');
              });
        }

        onGreen(e) {
            Router.go('/user/green');
        }
    }

    customElements.define('x-user', XUser);

    class XLoggedout extends LitElement {
        render() {
            return html`
        <style>
            .bg {
                background-color: red;
                width: 100vw;
                height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
        <div class="bg">
        </div>
        `
        }
    }

    customElements.define('x-loggedout', XLoggedout);

    const $_documentContainer$m = document.createElement('template');

    $_documentContainer$m.innerHTML = `<dom-module id="lumo-checkbox" theme-for="vaadin-checkbox">
  <template>
    <style include="lumo-checkbox-style lumo-checkbox-effects">
      /* IE11 only */
      ::-ms-backdrop,
      [part="checkbox"] {
        line-height: 1;
      }
    </style>
  </template>
</dom-module><dom-module id="lumo-checkbox-style">
  <template>
    <style>
      :host {
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
        cursor: default;
        outline: none;
      }

      [part="label"]:not([empty]) {
        margin: 0.1875em 0.875em 0.1875em 0.375em;
      }

      [part="checkbox"] {
        width: calc(1em + 2px);
        height: calc(1em + 2px);
        margin: 0.1875em;
        position: relative;
        border-radius: var(--lumo-border-radius);
        background-color: var(--lumo-contrast-20pct);
        transition: transform 0.2s cubic-bezier(.12, .32, .54, 2), background-color 0.15s;
        pointer-events: none;
        line-height: 1.2;
      }

      :host([indeterminate]) [part="checkbox"],
      :host([checked]) [part="checkbox"] {
        background-color: var(--lumo-primary-color);
      }

      /* Needed to align the checkbox nicely on the baseline */
      [part="checkbox"]::before {
        content: "\\2003";
      }

      /* Checkmark */
      [part="checkbox"]::after {
        content: "";
        display: inline-block;
        width: 0;
        height: 0;
        border: 0 solid var(--lumo-primary-contrast-color);
        border-width: 0.1875em 0 0 0.1875em;
        box-sizing: border-box;
        transform-origin: 0 0;
        position: absolute;
        top: 0.8125em;
        left: 0.5em;
        transform: scale(0.55) rotate(-135deg);
        opacity: 0;
      }

      :host([checked]) [part="checkbox"]::after {
        opacity: 1;
        width: 0.625em;
        height: 1.0625em;
      }

      /* Indeterminate checkmark */

      :host([indeterminate]) [part="checkbox"]::after {
        transform: none;
        opacity: 1;
        top: 45%;
        height: 10%;
        left: 22%;
        right: 22%;
        width: auto;
        border: 0;
        background-color: var(--lumo-primary-contrast-color);
        transition: opacity 0.25s;
      }

      /* Focus ring */

      :host([focus-ring]) [part="checkbox"] {
        box-shadow: 0 0 0 3px var(--lumo-primary-color-50pct);
      }

      /* Disabled */

      :host([disabled]) {
        pointer-events: none;
        color: var(--lumo-disabled-text-color);
      }

      :host([disabled]) [part="label"] ::slotted(*) {
        color: inherit;
      }

      :host([disabled]) [part="checkbox"] {
        background-color: var(--lumo-contrast-10pct);
      }

      :host([disabled]) [part="checkbox"]::after {
        border-color: var(--lumo-contrast-30pct);
      }

      :host([indeterminate][disabled]) [part="checkbox"]::after {
        background-color: var(--lumo-contrast-30pct);
      }
    </style>
  </template>
</dom-module><dom-module id="lumo-checkbox-effects">
  <template>
    <style>
      /* Transition the checkmark if activated with the mouse (disabled for grid select-all this way) */
      :host(:hover) [part="checkbox"]::after {
        transition: width 0.1s, height 0.25s;
      }

      /* Used for activation "halo" */
      [part="checkbox"]::before {
        color: transparent;
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background-color: inherit;
        transform: scale(1.4);
        opacity: 0;
        transition: transform 0.1s, opacity 0.8s;
      }

      /* Hover */

      :host(:not([checked]):not([indeterminate]):not([disabled]):hover) [part="checkbox"] {
        background-color: var(--lumo-contrast-30pct);
      }

      /* Disable hover for touch devices */
      @media (pointer: coarse) {
        :host(:not([checked]):not([indeterminate]):not([disabled]):hover) [part="checkbox"] {
          background-color: var(--lumo-contrast-20pct);
        }
      }

      /* Active */

      :host([active]) [part="checkbox"] {
        transform: scale(0.9);
        transition-duration: 0.05s;
      }

      :host([active][checked]) [part="checkbox"] {
        transform: scale(1.1);
      }

      :host([active]:not([checked])) [part="checkbox"]::before {
        transition-duration: 0.01s, 0.01s;
        transform: scale(0);
        opacity: 0.4;
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$m.content);

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    /**
     * `<vaadin-checkbox>` is a Web Component for customized checkboxes.
     *
     * ```html
     * <vaadin-checkbox>
     *   Make my profile visible
     * </vaadin-checkbox>
     * ```
     *
     * ### Styling
     *
     * The following shadow DOM parts are available for styling:
     *
     * Part name         | Description
     * ------------------|----------------
     * `checkbox`        | The checkbox element
     * `label`           | The label content element
     *
     * The following state attributes are available for styling:
     *
     * Attribute    | Description | Part name
     * -------------|-------------|--------------
     * `active`     | Set when the checkbox is pressed down, either with mouse, touch or the keyboard. | `:host`
     * `disabled`   | Set when the checkbox is disabled. | `:host`
     * `focus-ring` | Set when the checkbox is focused using the keyboard. | `:host`
     * `focused`    | Set when the checkbox is focused. | `:host`
     * `indeterminate` | Set when the checkbox is in indeterminate mode. | `:host`
     * `checked` | Set when the checkbox is checked. | `:host`
     * `empty` | Set when there is no label provided. | `label`
     *
     * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
     *
     * @memberof Vaadin
     * @mixes Vaadin.ElementMixin
     * @mixes Vaadin.ControlStateMixin
     * @mixes Vaadin.ThemableMixin
     * @mixes Polymer.GestureEventListeners
     * @demo demo/index.html
     */
    class CheckboxElement extends
      ElementMixin$1(
        ControlStateMixin(
          ThemableMixin(
            GestureEventListeners(PolymerElement)))) {
      static get template() {
        return html$1`
    <style>
      :host {
        display: inline-block;
      }

      label {
        display: inline-flex;
        align-items: baseline;
        outline: none;
      }

      [part="checkbox"] {
        position: relative;
        display: inline-block;
        flex: none;
      }

      input[type="checkbox"] {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: inherit;
        margin: 0;
      }

      :host([disabled]) {
        -webkit-tap-highlight-color: transparent;
      }
    </style>

    <label>
      <span part="checkbox">
        <input type="checkbox" checked="{{checked::change}}" disabled\$="[[disabled]]" indeterminate="{{indeterminate::change}}" role="presentation" tabindex="-1">
      </span>

      <span part="label">
        <slot></slot>
      </span>
    </label>
`;
      }

      static get is() {
        return 'vaadin-checkbox';
      }

      static get version() {
        return '2.2.2';
      }

      static get properties() {
        return {
          /**
           * True if the checkbox is checked.
           */
          checked: {
            type: Boolean,
            value: false,
            notify: true,
            observer: '_checkedChanged',
            reflectToAttribute: true
          },

          /**
           * Indeterminate state of the checkbox when it's neither checked nor unchecked, but undetermined.
           * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#Indeterminate_state_checkboxes
           */
          indeterminate: {
            type: Boolean,
            notify: true,
            observer: '_indeterminateChanged',
            reflectToAttribute: true
          },

          /**
           * The value given to the data submitted with the checkbox's name to the server when the control is inside a form.
           */
          value: {
            type: String,
            value: 'on'
          },

          _nativeCheckbox: {
            type: Object
          }
        };
      }

      constructor() {
        super();
        /**
         * @type {string}
         * Name of the element.
         */
        this.name;
      }

      get name() {
        return this.checked ? this._storedName : '';
      }

      set name(name) {
        this._storedName = name;
      }

      ready() {
        super.ready();

        this.setAttribute('role', 'checkbox');

        this._nativeCheckbox = this.shadowRoot.querySelector('input[type="checkbox"]');

        this.addEventListener('click', this._handleClick.bind(this));

        this._addActiveListeners();

        const attrName = this.getAttribute('name');
        if (attrName) {
          this.name = attrName;
        }

        this.shadowRoot.querySelector('[part~="label"]').querySelector('slot')
          .addEventListener('slotchange', this._updateLabelAttribute.bind(this));

        this._updateLabelAttribute();
      }

      _updateLabelAttribute() {
        const label = this.shadowRoot.querySelector('[part~="label"]');
        if (label.firstElementChild.assignedNodes().length === 0) {
          label.setAttribute('empty', '');
        } else {
          label.removeAttribute('empty');
        }
      }

      _checkedChanged(checked) {
        if (this.indeterminate) {
          this.setAttribute('aria-checked', 'mixed');
        } else {
          this.setAttribute('aria-checked', checked);
        }
      }

      _indeterminateChanged(indeterminate) {
        if (indeterminate) {
          this.setAttribute('aria-checked', 'mixed');
        } else {
          this.setAttribute('aria-checked', this.checked);
        }
      }

      _addActiveListeners() {
        // DOWN
        this._addEventListenerToNode(this, 'down', (e) => {
          if (this.__interactionsAllowed(e)) {
            this.setAttribute('active', '');
          }
        });

        // UP
        this._addEventListenerToNode(this, 'up', () => this.removeAttribute('active'));

        // KEYDOWN
        this.addEventListener('keydown', e => {
          if (this.__interactionsAllowed(e) && e.keyCode === 32) {
            e.preventDefault();
            this.setAttribute('active', '');
          }
        });

        // KEYUP
        this.addEventListener('keyup', e => {
          if (this.__interactionsAllowed(e) && e.keyCode === 32) {
            e.preventDefault();
            this._toggleChecked();
            this.removeAttribute('active');

            if (this.indeterminate) {
              this.indeterminate = false;
            }
          }
        });
      }

      get focusElement() {
        return this.shadowRoot.querySelector('label');
      }

      /**
       * True if users' interactions (mouse or keyboard)
       * should toggle the checkbox
       */
      __interactionsAllowed(e) {
        if (this.disabled) {
          return false;
        }

        // https://github.com/vaadin/vaadin-checkbox/issues/63
        if (e.target.localName === 'a') {
          return false;
        }

        return true;
      }

      _handleClick(e) {
        if (this.__interactionsAllowed(e)) {
          if (!this.indeterminate) {
            if (e.composedPath()[0] !== this._nativeCheckbox) {
              e.preventDefault();
              this._toggleChecked();
            }
          } else {
            /*
             * Required for IE 11 and Edge.
             * See issue here: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7344418/
             */
            this.indeterminate = false;
            e.preventDefault();
            this._toggleChecked();
          }
        }
      }

      _toggleChecked() {
        this.checked = !this.checked;
        this.dispatchEvent(new CustomEvent('change', {composed: true, bubbles: true}));
      }

      /**
       * Fired when the user commits a value change.
       *
       * @event change
       */
    }

    customElements.define(CheckboxElement.is, CheckboxElement);

    const $_documentContainer$n = document.createElement('template');

    $_documentContainer$n.innerHTML = `<dom-module id="lumo-radio-button" theme-for="vaadin-radio-button">
  <template>
    <style>
      :host {
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
        cursor: default;
      }

      [part="label"]:not(:empty) {
        margin: 0.1875em 0.875em 0.1875em 0.375em;
      }

      [part="radio"] {
        width: calc(1em + 2px);
        height: calc(1em + 2px);
        margin: 0.1875em;
        position: relative;
        border-radius: 50%;
        background-color: var(--lumo-contrast-20pct);
        transition: transform 0.2s cubic-bezier(.12, .32, .54, 2), background-color 0.15s;
        pointer-events: none;
        will-change: transform;
        line-height: 1.2;
      }

      /* Used for activation "halo" */
      [part="radio"]::before {
        /* Needed to align the radio-button nicely on the baseline */
        content: "\\2003";
        color: transparent;
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background-color: inherit;
        transform: scale(1.4);
        opacity: 0;
        transition: transform 0.1s, opacity 0.8s;
        will-change: transform, opacity;
      }

      /* Used for the dot */
      [part="radio"]::after {
        content: "";
        width: 0;
        height: 0;
        border: 3px solid var(--lumo-primary-contrast-color);
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: 0.25s transform;
        will-change: transform;
        background-clip: content-box;
      }

      :host([checked]) [part="radio"] {
        background-color: var(--lumo-primary-color);
      }

      :host([checked]) [part="radio"]::after {
        transform: translate(-50%, -50%) scale(1);
      }

      :host(:not([checked]):not([indeterminate]):not([disabled]):hover) [part="radio"] {
        background-color: var(--lumo-contrast-30pct);
      }

      :host([active]) [part="radio"] {
        transform: scale(0.9);
        transition-duration: 0.05s;
      }

      :host([active][checked]) [part="radio"] {
        transform: scale(1.1);
      }

      :host([active]:not([checked])) [part="radio"]::before {
        transition-duration: 0.01s, 0.01s;
        transform: scale(0);
        opacity: 0.4;
      }

      :host([focus-ring]) [part="radio"] {
        box-shadow: 0 0 0 3px var(--lumo-primary-color-50pct);
      }

      :host([disabled]) {
        pointer-events: none;
        color: var(--lumo-disabled-text-color);
      }

      :host([disabled]) ::slotted(*) {
        color: inherit;
      }

      :host([disabled]) [part="radio"] {
        background-color: var(--lumo-contrast-10pct);
      }

      :host([disabled]) [part="radio"]::after {
        border-color: var(--lumo-contrast-30pct);
      }

      /* IE11 only */
      ::-ms-backdrop,
      [part="radio"] {
        line-height: 1;
      }
    </style>
  </template>
</dom-module>`;

    document.head.appendChild($_documentContainer$n.content);

    /**
    @license
    Copyright (c) 2017 Vaadin Ltd.
    This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
    */
    /**
     * `<vaadin-radio-button>` is a Web Component for radio buttons.
     *
     * ```html
     * <vaadin-radio-button value="foo">Foo</vaadin-radio-button>
     * ```
     *
     * ### Styling
     *
     * The following shadow DOM parts are available for styling:
     *
     * Part name         | Description
     * ------------------|----------------
     * `radio`           | The radio button element
     * `label`           | The label content element
     *
     * The following state attributes are available for styling:
     *
     * Attribute  | Description | Part name
     * -----------|-------------|------------
     * `disabled`   | Set when the radio button is disabled. | :host
     * `focus-ring` | Set when the radio button is focused using the keyboard. | :host
     * `focused`    | Set when the radio button is focused. | :host
     * `checked`    | Set when the radio button is checked. | :host
     *
     * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
     *
     * @memberof Vaadin
     * @mixes Vaadin.ElementMixin
     * @mixes Vaadin.ControlStateMixin
     * @mixes Vaadin.ThemableMixin
     * @mixes Polymer.GestureEventListeners
     * @element vaadin-radio-button
     * @demo demo/index.html
     */
    class RadioButtonElement extends
      ElementMixin$1(
        ControlStateMixin(
          ThemableMixin(
            GestureEventListeners(PolymerElement)))) {
      static get template() {
        return html$1`
    <style>
      :host {
        display: inline-block;
      }

      label {
        display: inline-flex;
        align-items: baseline;
        outline: none;
      }

      [part="radio"] {
        position: relative;
        display: inline-block;
        flex: none;
      }

      input[type="radio"] {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: inherit;
        margin: 0;
      }

      :host([disabled]) {
        -webkit-tap-highlight-color: transparent;
      }
    </style>

    <label on-click="_preventDefault">
      <span part="radio">
        <input type="radio" checked="{{checked::change}}" disabled\$="[[disabled]]" role="presentation" tabindex="-1">
      </span>

      <span part="label">
        <slot></slot>
      </span>
    </label>
`;
      }

      static get is() {
        return 'vaadin-radio-button';
      }

      static get version() {
        return '1.1.2';
      }

      static get properties() {
        return {
          /**
           * True if the radio button is checked.
           */
          checked: {
            type: Boolean,
            value: false,
            notify: true,
            observer: '_checkedChanged',
            reflectToAttribute: true
          },

          /**
           * The value for this element.
           */
          value: {
            type: String,
            value: 'on'
          }

        };
      }

      constructor() {
        super();

        /**
         * @type {string}
         * Name of the element.
         */
        this.name;
      }

      get name() {
        return this.checked ? this._storedName : '';
      }

      set name(name) {
        this._storedName = name;
      }

      ready() {
        super.ready();

        this.setAttribute('role', 'radio');

        this.addEventListener('click', this._handleClick.bind(this));

        this._addActiveListeners();

        const attrName = this.getAttribute('name');
        if (attrName) {
          this.name = attrName;
        }
      }

      _checkedChanged(checked) {
        this.setAttribute('aria-checked', checked);
      }

      _addActiveListeners() {
        this._addEventListenerToNode(this, 'down', (e) => {
          if (!this.disabled) {
            this.setAttribute('active', '');
          }
        });

        this._addEventListenerToNode(this, 'up', (e) => {
          this.removeAttribute('active');

          if (!this.checked && !this.disabled) {
            this.checked = true;
          }
        });

        this.addEventListener('keydown', e => {
          if (!this.disabled && e.keyCode === 32) {
            e.preventDefault();
            this.setAttribute('active', '');
          }
        });

        this.addEventListener('keyup', e => {
          if (!this.disabled && e.keyCode === 32) {
            e.preventDefault();
            this.setAttribute('checked', '');
            this.removeAttribute('active');
          }
        });
      }

      _handleClick(e) {
        if (!this.disabled) {
          e.preventDefault();
          this.checked = true;
        }
      }

      /** @protected */
      get focusElement() {
        return this.shadowRoot.querySelector('input');
      }

      _preventDefault(e) {
        e.preventDefault();
      }
    }

    customElements.define(RadioButtonElement.is, RadioButtonElement);

    class XRadiogroup extends LitElement {
        static get properties() {
            return {
              selected: {type: String, reflect: true}
            };
          }
        
        render() {
            return html`
            <slot @slotchange=${this.onSlotchange.bind(this)}></slot>
        `
        }

        onCheckedChanged(e) {
            if(e.detail.value) {
                console.log('e');
                console.log(e);
                this.selected = e.path[0].attributes['name'].value;
                console.log('selected');
                console.log(this.selected);
                this.dispatchEvent(new CustomEvent('selected-changed', {
                    detail: {
                      selected: this.selected
                    }
                  }));
                let buttons = this.shadowRoot.querySelector('slot').assignedNodes().filter((node) => { return node.nodeName !== '#text'; });
                buttons.forEach(button => {
                    if(button !== e.path[0]) {
                        button.removeAttribute('checked');
                    }
                });
            }
        }

        onSlotchange({target}) {
            let buttons = target.assignedNodes();
            buttons.forEach(button => {
                button.addEventListener('checked-changed', this.onCheckedChanged.bind(this));
            });
          }
    }

    customElements.define('x-radiogroup', XRadiogroup);

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var keys = createCommonjsModule(function (module, exports) {
    exports = module.exports = typeof Object.keys === 'function'
      ? Object.keys : shim;

    exports.shim = shim;
    function shim (obj) {
      var keys = [];
      for (var key in obj) keys.push(key);
      return keys;
    }
    });
    var keys_1 = keys.shim;

    var is_arguments = createCommonjsModule(function (module, exports) {
    var supportsArgumentsClass = (function(){
      return Object.prototype.toString.call(arguments)
    })() == '[object Arguments]';

    exports = module.exports = supportsArgumentsClass ? supported : unsupported;

    exports.supported = supported;
    function supported(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }
    exports.unsupported = unsupported;
    function unsupported(object){
      return object &&
        typeof object == 'object' &&
        typeof object.length == 'number' &&
        Object.prototype.hasOwnProperty.call(object, 'callee') &&
        !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
        false;
    }});
    var is_arguments_1 = is_arguments.supported;
    var is_arguments_2 = is_arguments.unsupported;

    var deepEqual_1 = createCommonjsModule(function (module) {
    var pSlice = Array.prototype.slice;



    var deepEqual = module.exports = function (actual, expected, opts) {
      if (!opts) opts = {};
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
        return opts.strict ? actual === expected : actual == expected;

      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected, opts);
      }
    };

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isBuffer (x) {
      if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
      if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== 'number') return false;
      return true;
    }

    function objEquiv(a, b, opts) {
      var i, key;
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;
      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (is_arguments(a)) {
        if (!is_arguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return deepEqual(a, b, opts);
      }
      if (isBuffer(a)) {
        if (!isBuffer(b)) {
          return false;
        }
        if (a.length !== b.length) return false;
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
      try {
        var ka = keys(a),
            kb = keys(b);
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) return false;
      }
      return typeof a === typeof b;
    }
    });

    var toStr = Object.prototype.toString;

    var isArguments = function isArguments(value) {
    	var str = toStr.call(value);
    	var isArgs = str === '[object Arguments]';
    	if (!isArgs) {
    		isArgs = str !== '[object Array]' &&
    			value !== null &&
    			typeof value === 'object' &&
    			typeof value.length === 'number' &&
    			value.length >= 0 &&
    			toStr.call(value.callee) === '[object Function]';
    	}
    	return isArgs;
    };

    // modified from https://github.com/es-shims/es5-shim
    var has = Object.prototype.hasOwnProperty;
    var toStr$1 = Object.prototype.toString;
    var slice = Array.prototype.slice;

    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
    var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
    var dontEnums = [
    	'toString',
    	'toLocaleString',
    	'valueOf',
    	'hasOwnProperty',
    	'isPrototypeOf',
    	'propertyIsEnumerable',
    	'constructor'
    ];
    var equalsConstructorPrototype = function (o) {
    	var ctor = o.constructor;
    	return ctor && ctor.prototype === o;
    };
    var excludedKeys = {
    	$applicationCache: true,
    	$console: true,
    	$external: true,
    	$frame: true,
    	$frameElement: true,
    	$frames: true,
    	$innerHeight: true,
    	$innerWidth: true,
    	$outerHeight: true,
    	$outerWidth: true,
    	$pageXOffset: true,
    	$pageYOffset: true,
    	$parent: true,
    	$scrollLeft: true,
    	$scrollTop: true,
    	$scrollX: true,
    	$scrollY: true,
    	$self: true,
    	$webkitIndexedDB: true,
    	$webkitStorageInfo: true,
    	$window: true
    };
    var hasAutomationEqualityBug = (function () {
    	/* global window */
    	if (typeof window === 'undefined') { return false; }
    	for (var k in window) {
    		try {
    			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
    				try {
    					equalsConstructorPrototype(window[k]);
    				} catch (e) {
    					return true;
    				}
    			}
    		} catch (e) {
    			return true;
    		}
    	}
    	return false;
    }());
    var equalsConstructorPrototypeIfNotBuggy = function (o) {
    	/* global window */
    	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
    		return equalsConstructorPrototype(o);
    	}
    	try {
    		return equalsConstructorPrototype(o);
    	} catch (e) {
    		return false;
    	}
    };

    var keysShim = function keys(object) {
    	var isObject = object !== null && typeof object === 'object';
    	var isFunction = toStr$1.call(object) === '[object Function]';
    	var isArguments$$1 = isArguments(object);
    	var isString = isObject && toStr$1.call(object) === '[object String]';
    	var theKeys = [];

    	if (!isObject && !isFunction && !isArguments$$1) {
    		throw new TypeError('Object.keys called on a non-object');
    	}

    	var skipProto = hasProtoEnumBug && isFunction;
    	if (isString && object.length > 0 && !has.call(object, 0)) {
    		for (var i = 0; i < object.length; ++i) {
    			theKeys.push(String(i));
    		}
    	}

    	if (isArguments$$1 && object.length > 0) {
    		for (var j = 0; j < object.length; ++j) {
    			theKeys.push(String(j));
    		}
    	} else {
    		for (var name in object) {
    			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
    				theKeys.push(String(name));
    			}
    		}
    	}

    	if (hasDontEnumBug) {
    		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

    		for (var k = 0; k < dontEnums.length; ++k) {
    			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
    				theKeys.push(dontEnums[k]);
    			}
    		}
    	}
    	return theKeys;
    };

    keysShim.shim = function shimObjectKeys() {
    	if (Object.keys) {
    		var keysWorksWithArguments = (function () {
    			// Safari 5.0 bug
    			return (Object.keys(arguments) || '').length === 2;
    		}(1, 2));
    		if (!keysWorksWithArguments) {
    			var originalKeys = Object.keys;
    			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
    				if (isArguments(object)) {
    					return originalKeys(slice.call(object));
    				} else {
    					return originalKeys(object);
    				}
    			};
    		}
    	} else {
    		Object.keys = keysShim;
    	}
    	return Object.keys || keysShim;
    };

    var objectKeys = keysShim;

    var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

    var toStr$2 = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var origDefineProperty = Object.defineProperty;

    var isFunction$1 = function (fn) {
    	return typeof fn === 'function' && toStr$2.call(fn) === '[object Function]';
    };

    var arePropertyDescriptorsSupported = function () {
    	var obj = {};
    	try {
    		origDefineProperty(obj, 'x', { enumerable: false, value: obj });
    		// eslint-disable-next-line no-unused-vars, no-restricted-syntax
    		for (var _ in obj) { // jscs:ignore disallowUnusedVariables
    			return false;
    		}
    		return obj.x === obj;
    	} catch (e) { /* this is IE 8. */
    		return false;
    	}
    };
    var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

    var defineProperty = function (object, name, value, predicate) {
    	if (name in object && (!isFunction$1(predicate) || !predicate())) {
    		return;
    	}
    	if (supportsDescriptors) {
    		origDefineProperty(object, name, {
    			configurable: true,
    			enumerable: false,
    			value: value,
    			writable: true
    		});
    	} else {
    		object[name] = value;
    	}
    };

    var defineProperties = function (object, map) {
    	var predicates = arguments.length > 2 ? arguments[2] : {};
    	var props = objectKeys(map);
    	if (hasSymbols) {
    		props = concat.call(props, Object.getOwnPropertySymbols(map));
    	}
    	for (var i = 0; i < props.length; i += 1) {
    		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
    	}
    };

    defineProperties.supportsDescriptors = !!supportsDescriptors;

    var defineProperties_1 = defineProperties;

    /* eslint no-invalid-this: 1 */

    var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
    var slice$1 = Array.prototype.slice;
    var toStr$3 = Object.prototype.toString;
    var funcType = '[object Function]';

    var implementation = function bind(that) {
        var target = this;
        if (typeof target !== 'function' || toStr$3.call(target) !== funcType) {
            throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slice$1.call(arguments, 1);

        var bound;
        var binder = function () {
            if (this instanceof bound) {
                var result = target.apply(
                    this,
                    args.concat(slice$1.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                return target.apply(
                    that,
                    args.concat(slice$1.call(arguments))
                );
            }
        };

        var boundLength = Math.max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

        if (target.prototype) {
            var Empty = function Empty() {};
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }

        return bound;
    };

    var functionBind = Function.prototype.bind || implementation;

    var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

    var isPrimitive$1 = function isPrimitive(value) {
    	return value === null || (typeof value !== 'function' && typeof value !== 'object');
    };

    var fnToStr = Function.prototype.toString;

    var constructorRegex = /^\s*class\b/;
    var isES6ClassFn = function isES6ClassFunction(value) {
    	try {
    		var fnStr = fnToStr.call(value);
    		return constructorRegex.test(fnStr);
    	} catch (e) {
    		return false; // not a function
    	}
    };

    var tryFunctionObject = function tryFunctionToStr(value) {
    	try {
    		if (isES6ClassFn(value)) { return false; }
    		fnToStr.call(value);
    		return true;
    	} catch (e) {
    		return false;
    	}
    };
    var toStr$4 = Object.prototype.toString;
    var fnClass = '[object Function]';
    var genClass = '[object GeneratorFunction]';
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

    var isCallable = function isCallable(value) {
    	if (!value) { return false; }
    	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
    	if (typeof value === 'function' && !value.prototype) { return true; }
    	if (hasToStringTag) { return tryFunctionObject(value); }
    	if (isES6ClassFn(value)) { return false; }
    	var strClass = toStr$4.call(value);
    	return strClass === fnClass || strClass === genClass;
    };

    var getDay = Date.prototype.getDay;
    var tryDateObject = function tryDateObject(value) {
    	try {
    		getDay.call(value);
    		return true;
    	} catch (e) {
    		return false;
    	}
    };

    var toStr$5 = Object.prototype.toString;
    var dateClass = '[object Date]';
    var hasToStringTag$1 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

    var isDateObject = function isDateObject(value) {
    	if (typeof value !== 'object' || value === null) { return false; }
    	return hasToStringTag$1 ? tryDateObject(value) : toStr$5.call(value) === dateClass;
    };

    /* eslint complexity: [2, 17], max-statements: [2, 33] */
    var shams = function hasSymbols() {
    	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
    	if (typeof Symbol.iterator === 'symbol') { return true; }

    	var obj = {};
    	var sym = Symbol('test');
    	var symObj = Object(sym);
    	if (typeof sym === 'string') { return false; }

    	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
    	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

    	// temp disabled per https://github.com/ljharb/object.assign/issues/17
    	// if (sym instanceof Symbol) { return false; }
    	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    	// if (!(symObj instanceof Symbol)) { return false; }

    	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
    	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

    	var symVal = 42;
    	obj[sym] = symVal;
    	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax
    	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

    	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

    	var syms = Object.getOwnPropertySymbols(obj);
    	if (syms.length !== 1 || syms[0] !== sym) { return false; }

    	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

    	if (typeof Object.getOwnPropertyDescriptor === 'function') {
    		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
    		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
    	}

    	return true;
    };

    var origSymbol = commonjsGlobal.Symbol;


    var hasSymbols$1 = function hasNativeSymbols() {
    	if (typeof origSymbol !== 'function') { return false; }
    	if (typeof Symbol !== 'function') { return false; }
    	if (typeof origSymbol('foo') !== 'symbol') { return false; }
    	if (typeof Symbol('bar') !== 'symbol') { return false; }

    	return shams();
    };

    var isSymbol = createCommonjsModule(function (module) {

    var toStr = Object.prototype.toString;
    var hasSymbols = hasSymbols$1();

    if (hasSymbols) {
    	var symToStr = Symbol.prototype.toString;
    	var symStringRegex = /^Symbol\(.*\)$/;
    	var isSymbolObject = function isRealSymbolObject(value) {
    		if (typeof value.valueOf() !== 'symbol') {
    			return false;
    		}
    		return symStringRegex.test(symToStr.call(value));
    	};

    	module.exports = function isSymbol(value) {
    		if (typeof value === 'symbol') {
    			return true;
    		}
    		if (toStr.call(value) !== '[object Symbol]') {
    			return false;
    		}
    		try {
    			return isSymbolObject(value);
    		} catch (e) {
    			return false;
    		}
    	};
    } else {

    	module.exports = function isSymbol(value) {
    		// this environment does not support Symbols.
    		return false;
    	};
    }
    });

    var hasSymbols$2 = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';






    var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
    	if (typeof O === 'undefined' || O === null) {
    		throw new TypeError('Cannot call method on ' + O);
    	}
    	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
    		throw new TypeError('hint must be "string" or "number"');
    	}
    	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    	var method, result, i;
    	for (i = 0; i < methodNames.length; ++i) {
    		method = O[methodNames[i]];
    		if (isCallable(method)) {
    			result = method.call(O);
    			if (isPrimitive$1(result)) {
    				return result;
    			}
    		}
    	}
    	throw new TypeError('No default value');
    };

    var GetMethod = function GetMethod(O, P) {
    	var func = O[P];
    	if (func !== null && typeof func !== 'undefined') {
    		if (!isCallable(func)) {
    			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
    		}
    		return func;
    	}
    	return void 0;
    };

    // http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
    var es2015 = function ToPrimitive(input) {
    	if (isPrimitive$1(input)) {
    		return input;
    	}
    	var hint = 'default';
    	if (arguments.length > 1) {
    		if (arguments[1] === String) {
    			hint = 'string';
    		} else if (arguments[1] === Number) {
    			hint = 'number';
    		}
    	}

    	var exoticToPrim;
    	if (hasSymbols$2) {
    		if (Symbol.toPrimitive) {
    			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
    		} else if (isSymbol(input)) {
    			exoticToPrim = Symbol.prototype.valueOf;
    		}
    	}
    	if (typeof exoticToPrim !== 'undefined') {
    		var result = exoticToPrim.call(input, hint);
    		if (isPrimitive$1(result)) {
    			return result;
    		}
    		throw new TypeError('unable to convert exotic object to primitive');
    	}
    	if (hint === 'default' && (isDateObject(input) || isSymbol(input))) {
    		hint = 'string';
    	}
    	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
    };

    var es6 = es2015;

    /* globals
    	Set,
    	Map,
    	WeakSet,
    	WeakMap,

    	Promise,

    	Symbol,
    	Proxy,

    	Atomics,
    	SharedArrayBuffer,

    	ArrayBuffer,
    	DataView,
    	Uint8Array,
    	Float32Array,
    	Float64Array,
    	Int8Array,
    	Int16Array,
    	Int32Array,
    	Uint8ClampedArray,
    	Uint16Array,
    	Uint32Array,
    */

    var undefined$1; // eslint-disable-line no-shadow-restricted-names

    var ThrowTypeError = Object.getOwnPropertyDescriptor
    	? (function () { return Object.getOwnPropertyDescriptor(arguments, 'callee').get; }())
    	: function () { throw new TypeError(); };

    var hasSymbols$3 = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

    var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto
    var generatorFunction = undefined$1;
    var asyncFunction = undefined$1;
    var asyncGenFunction = undefined$1;

    var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);

    var INTRINSICS = {
    	'$ %Array%': Array,
    	'$ %ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
    	'$ %ArrayBufferPrototype%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer.prototype,
    	'$ %ArrayIteratorPrototype%': hasSymbols$3 ? getProto([][Symbol.iterator]()) : undefined$1,
    	'$ %ArrayPrototype%': Array.prototype,
    	'$ %ArrayProto_entries%': Array.prototype.entries,
    	'$ %ArrayProto_forEach%': Array.prototype.forEach,
    	'$ %ArrayProto_keys%': Array.prototype.keys,
    	'$ %ArrayProto_values%': Array.prototype.values,
    	'$ %AsyncFromSyncIteratorPrototype%': undefined$1,
    	'$ %AsyncFunction%': asyncFunction,
    	'$ %AsyncFunctionPrototype%': undefined$1,
    	'$ %AsyncGenerator%': undefined$1,
    	'$ %AsyncGeneratorFunction%': asyncGenFunction,
    	'$ %AsyncGeneratorPrototype%': undefined$1,
    	'$ %AsyncIteratorPrototype%': undefined$1,
    	'$ %Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
    	'$ %Boolean%': Boolean,
    	'$ %BooleanPrototype%': Boolean.prototype,
    	'$ %DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
    	'$ %DataViewPrototype%': typeof DataView === 'undefined' ? undefined$1 : DataView.prototype,
    	'$ %Date%': Date,
    	'$ %DatePrototype%': Date.prototype,
    	'$ %decodeURI%': decodeURI,
    	'$ %decodeURIComponent%': decodeURIComponent,
    	'$ %encodeURI%': encodeURI,
    	'$ %encodeURIComponent%': encodeURIComponent,
    	'$ %Error%': Error,
    	'$ %ErrorPrototype%': Error.prototype,
    	'$ %eval%': eval, // eslint-disable-line no-eval
    	'$ %EvalError%': EvalError,
    	'$ %EvalErrorPrototype%': EvalError.prototype,
    	'$ %Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
    	'$ %Float32ArrayPrototype%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array.prototype,
    	'$ %Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
    	'$ %Float64ArrayPrototype%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array.prototype,
    	'$ %Function%': Function,
    	'$ %FunctionPrototype%': Function.prototype,
    	'$ %Generator%': undefined$1,
    	'$ %GeneratorFunction%': generatorFunction,
    	'$ %GeneratorPrototype%': undefined$1,
    	'$ %Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
    	'$ %Int8ArrayPrototype%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array.prototype,
    	'$ %Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
    	'$ %Int16ArrayPrototype%': typeof Int16Array === 'undefined' ? undefined$1 : Int8Array.prototype,
    	'$ %Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
    	'$ %Int32ArrayPrototype%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array.prototype,
    	'$ %isFinite%': isFinite,
    	'$ %isNaN%': isNaN,
    	'$ %IteratorPrototype%': hasSymbols$3 ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
    	'$ %JSON%': JSON,
    	'$ %JSONParse%': JSON.parse,
    	'$ %Map%': typeof Map === 'undefined' ? undefined$1 : Map,
    	'$ %MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$3 ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
    	'$ %MapPrototype%': typeof Map === 'undefined' ? undefined$1 : Map.prototype,
    	'$ %Math%': Math,
    	'$ %Number%': Number,
    	'$ %NumberPrototype%': Number.prototype,
    	'$ %Object%': Object,
    	'$ %ObjectPrototype%': Object.prototype,
    	'$ %ObjProto_toString%': Object.prototype.toString,
    	'$ %ObjProto_valueOf%': Object.prototype.valueOf,
    	'$ %parseFloat%': parseFloat,
    	'$ %parseInt%': parseInt,
    	'$ %Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
    	'$ %PromisePrototype%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype,
    	'$ %PromiseProto_then%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype.then,
    	'$ %Promise_all%': typeof Promise === 'undefined' ? undefined$1 : Promise.all,
    	'$ %Promise_reject%': typeof Promise === 'undefined' ? undefined$1 : Promise.reject,
    	'$ %Promise_resolve%': typeof Promise === 'undefined' ? undefined$1 : Promise.resolve,
    	'$ %Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
    	'$ %RangeError%': RangeError,
    	'$ %RangeErrorPrototype%': RangeError.prototype,
    	'$ %ReferenceError%': ReferenceError,
    	'$ %ReferenceErrorPrototype%': ReferenceError.prototype,
    	'$ %Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
    	'$ %RegExp%': RegExp,
    	'$ %RegExpPrototype%': RegExp.prototype,
    	'$ %Set%': typeof Set === 'undefined' ? undefined$1 : Set,
    	'$ %SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$3 ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
    	'$ %SetPrototype%': typeof Set === 'undefined' ? undefined$1 : Set.prototype,
    	'$ %SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
    	'$ %SharedArrayBufferPrototype%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer.prototype,
    	'$ %String%': String,
    	'$ %StringIteratorPrototype%': hasSymbols$3 ? getProto(''[Symbol.iterator]()) : undefined$1,
    	'$ %StringPrototype%': String.prototype,
    	'$ %Symbol%': hasSymbols$3 ? Symbol : undefined$1,
    	'$ %SymbolPrototype%': hasSymbols$3 ? Symbol.prototype : undefined$1,
    	'$ %SyntaxError%': SyntaxError,
    	'$ %SyntaxErrorPrototype%': SyntaxError.prototype,
    	'$ %ThrowTypeError%': ThrowTypeError,
    	'$ %TypedArray%': TypedArray,
    	'$ %TypedArrayPrototype%': TypedArray ? TypedArray.prototype : undefined$1,
    	'$ %TypeError%': TypeError,
    	'$ %TypeErrorPrototype%': TypeError.prototype,
    	'$ %Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
    	'$ %Uint8ArrayPrototype%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array.prototype,
    	'$ %Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
    	'$ %Uint8ClampedArrayPrototype%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray.prototype,
    	'$ %Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
    	'$ %Uint16ArrayPrototype%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array.prototype,
    	'$ %Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
    	'$ %Uint32ArrayPrototype%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array.prototype,
    	'$ %URIError%': URIError,
    	'$ %URIErrorPrototype%': URIError.prototype,
    	'$ %WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
    	'$ %WeakMapPrototype%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap.prototype,
    	'$ %WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,
    	'$ %WeakSetPrototype%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet.prototype
    };

    var GetIntrinsic = function GetIntrinsic(name, allowMissing) {
    	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    		throw new TypeError('"allowMissing" argument must be a boolean');
    	}

    	var key = '$ ' + name;
    	if (!(key in INTRINSICS)) {
    		throw new SyntaxError('intrinsic ' + name + ' does not exist!');
    	}

    	// istanbul ignore if // hopefully this is impossible to test :-)
    	if (typeof INTRINSICS[key] === 'undefined' && !allowMissing) {
    		throw new TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
    	}
    	return INTRINSICS[key];
    };

    var _isNaN = Number.isNaN || function isNaN(a) {
    	return a !== a;
    };

    var $isNaN = Number.isNaN || function (a) { return a !== a; };

    var _isFinite = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

    var has$1 = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

    var $assign = Object.assign;

    var assign = function assign(target, source) {
    	if ($assign) {
    		return $assign(target, source);
    	}

    	for (var key in source) {
    		if (has$1(source, key)) {
    			target[key] = source[key];
    		}
    	}
    	return target;
    };

    var sign = function sign(number) {
    	return number >= 0 ? 1 : -1;
    };

    var mod = function mod(number, modulo) {
    	var remain = number % modulo;
    	return Math.floor(remain >= 0 ? remain : remain + modulo);
    };

    var isPrimitive$2 = function isPrimitive(value) {
    	return value === null || (typeof value !== 'function' && typeof value !== 'object');
    };

    var toStr$6 = Object.prototype.toString;





    // http://ecma-international.org/ecma-262/5.1/#sec-8.12.8
    var ES5internalSlots = {
    	'[[DefaultValue]]': function (O) {
    		var actualHint;
    		if (arguments.length > 1) {
    			actualHint = arguments[1];
    		} else {
    			actualHint = toStr$6.call(O) === '[object Date]' ? String : Number;
    		}

    		if (actualHint === String || actualHint === Number) {
    			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
    			var value, i;
    			for (i = 0; i < methods.length; ++i) {
    				if (isCallable(O[methods[i]])) {
    					value = O[methods[i]]();
    					if (isPrimitive$1(value)) {
    						return value;
    					}
    				}
    			}
    			throw new TypeError('No default value');
    		}
    		throw new TypeError('invalid [[DefaultValue]] hint supplied');
    	}
    };

    // http://ecma-international.org/ecma-262/5.1/#sec-9.1
    var es5 = function ToPrimitive(input) {
    	if (isPrimitive$1(input)) {
    		return input;
    	}
    	if (arguments.length > 1) {
    		return ES5internalSlots['[[DefaultValue]]'](input, arguments[1]);
    	}
    	return ES5internalSlots['[[DefaultValue]]'](input);
    };

    var $Object = GetIntrinsic('%Object%');
    var $TypeError = GetIntrinsic('%TypeError%');
    var $String = GetIntrinsic('%String%');












    // https://es5.github.io/#x9
    var ES5 = {
    	ToPrimitive: es5,

    	ToBoolean: function ToBoolean(value) {
    		return !!value;
    	},
    	ToNumber: function ToNumber(value) {
    		return +value; // eslint-disable-line no-implicit-coercion
    	},
    	ToInteger: function ToInteger(value) {
    		var number = this.ToNumber(value);
    		if (_isNaN(number)) { return 0; }
    		if (number === 0 || !_isFinite(number)) { return number; }
    		return sign(number) * Math.floor(Math.abs(number));
    	},
    	ToInt32: function ToInt32(x) {
    		return this.ToNumber(x) >> 0;
    	},
    	ToUint32: function ToUint32(x) {
    		return this.ToNumber(x) >>> 0;
    	},
    	ToUint16: function ToUint16(value) {
    		var number = this.ToNumber(value);
    		if (_isNaN(number) || number === 0 || !_isFinite(number)) { return 0; }
    		var posInt = sign(number) * Math.floor(Math.abs(number));
    		return mod(posInt, 0x10000);
    	},
    	ToString: function ToString(value) {
    		return $String(value);
    	},
    	ToObject: function ToObject(value) {
    		this.CheckObjectCoercible(value);
    		return $Object(value);
    	},
    	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
    		/* jshint eqnull:true */
    		if (value == null) {
    			throw new $TypeError(optMessage || 'Cannot call method on ' + value);
    		}
    		return value;
    	},
    	IsCallable: isCallable,
    	SameValue: function SameValue(x, y) {
    		if (x === y) { // 0 === -0, but they are not identical.
    			if (x === 0) { return 1 / x === 1 / y; }
    			return true;
    		}
    		return _isNaN(x) && _isNaN(y);
    	},

    	// https://www.ecma-international.org/ecma-262/5.1/#sec-8
    	Type: function Type(x) {
    		if (x === null) {
    			return 'Null';
    		}
    		if (typeof x === 'undefined') {
    			return 'Undefined';
    		}
    		if (typeof x === 'function' || typeof x === 'object') {
    			return 'Object';
    		}
    		if (typeof x === 'number') {
    			return 'Number';
    		}
    		if (typeof x === 'boolean') {
    			return 'Boolean';
    		}
    		if (typeof x === 'string') {
    			return 'String';
    		}
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
    	IsPropertyDescriptor: function IsPropertyDescriptor(Desc) {
    		if (this.Type(Desc) !== 'Object') {
    			return false;
    		}
    		var allowed = {
    			'[[Configurable]]': true,
    			'[[Enumerable]]': true,
    			'[[Get]]': true,
    			'[[Set]]': true,
    			'[[Value]]': true,
    			'[[Writable]]': true
    		};
    		// jscs:disable
    		for (var key in Desc) { // eslint-disable-line
    			if (src(Desc, key) && !allowed[key]) {
    				return false;
    			}
    		}
    		// jscs:enable
    		var isData = src(Desc, '[[Value]]');
    		var IsAccessor = src(Desc, '[[Get]]') || src(Desc, '[[Set]]');
    		if (isData && IsAccessor) {
    			throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
    		}
    		return true;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.1
    	IsAccessorDescriptor: function IsAccessorDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return false;
    		}

    		if (!this.IsPropertyDescriptor(Desc)) {
    			throw new $TypeError('Desc must be a Property Descriptor');
    		}

    		if (!src(Desc, '[[Get]]') && !src(Desc, '[[Set]]')) {
    			return false;
    		}

    		return true;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.2
    	IsDataDescriptor: function IsDataDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return false;
    		}

    		if (!this.IsPropertyDescriptor(Desc)) {
    			throw new $TypeError('Desc must be a Property Descriptor');
    		}

    		if (!src(Desc, '[[Value]]') && !src(Desc, '[[Writable]]')) {
    			return false;
    		}

    		return true;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.3
    	IsGenericDescriptor: function IsGenericDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return false;
    		}

    		if (!this.IsPropertyDescriptor(Desc)) {
    			throw new $TypeError('Desc must be a Property Descriptor');
    		}

    		if (!this.IsAccessorDescriptor(Desc) && !this.IsDataDescriptor(Desc)) {
    			return true;
    		}

    		return false;
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.4
    	FromPropertyDescriptor: function FromPropertyDescriptor(Desc) {
    		if (typeof Desc === 'undefined') {
    			return Desc;
    		}

    		if (!this.IsPropertyDescriptor(Desc)) {
    			throw new $TypeError('Desc must be a Property Descriptor');
    		}

    		if (this.IsDataDescriptor(Desc)) {
    			return {
    				value: Desc['[[Value]]'],
    				writable: !!Desc['[[Writable]]'],
    				enumerable: !!Desc['[[Enumerable]]'],
    				configurable: !!Desc['[[Configurable]]']
    			};
    		} else if (this.IsAccessorDescriptor(Desc)) {
    			return {
    				get: Desc['[[Get]]'],
    				set: Desc['[[Set]]'],
    				enumerable: !!Desc['[[Enumerable]]'],
    				configurable: !!Desc['[[Configurable]]']
    			};
    		} else {
    			throw new $TypeError('FromPropertyDescriptor must be called with a fully populated Property Descriptor');
    		}
    	},

    	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.5
    	ToPropertyDescriptor: function ToPropertyDescriptor(Obj) {
    		if (this.Type(Obj) !== 'Object') {
    			throw new $TypeError('ToPropertyDescriptor requires an object');
    		}

    		var desc = {};
    		if (src(Obj, 'enumerable')) {
    			desc['[[Enumerable]]'] = this.ToBoolean(Obj.enumerable);
    		}
    		if (src(Obj, 'configurable')) {
    			desc['[[Configurable]]'] = this.ToBoolean(Obj.configurable);
    		}
    		if (src(Obj, 'value')) {
    			desc['[[Value]]'] = Obj.value;
    		}
    		if (src(Obj, 'writable')) {
    			desc['[[Writable]]'] = this.ToBoolean(Obj.writable);
    		}
    		if (src(Obj, 'get')) {
    			var getter = Obj.get;
    			if (typeof getter !== 'undefined' && !this.IsCallable(getter)) {
    				throw new TypeError('getter must be a function');
    			}
    			desc['[[Get]]'] = getter;
    		}
    		if (src(Obj, 'set')) {
    			var setter = Obj.set;
    			if (typeof setter !== 'undefined' && !this.IsCallable(setter)) {
    				throw new $TypeError('setter must be a function');
    			}
    			desc['[[Set]]'] = setter;
    		}

    		if ((src(desc, '[[Get]]') || src(desc, '[[Set]]')) && (src(desc, '[[Value]]') || src(desc, '[[Writable]]'))) {
    			throw new $TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
    		}
    		return desc;
    	}
    };

    var es5$1 = ES5;

    var regexExec = RegExp.prototype.exec;
    var gOPD = Object.getOwnPropertyDescriptor;

    var tryRegexExecCall = function tryRegexExec(value) {
    	try {
    		var lastIndex = value.lastIndex;
    		value.lastIndex = 0;

    		regexExec.call(value);
    		return true;
    	} catch (e) {
    		return false;
    	} finally {
    		value.lastIndex = lastIndex;
    	}
    };
    var toStr$7 = Object.prototype.toString;
    var regexClass = '[object RegExp]';
    var hasToStringTag$2 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

    var isRegex = function isRegex(value) {
    	if (!value || typeof value !== 'object') {
    		return false;
    	}
    	if (!hasToStringTag$2) {
    		return toStr$7.call(value) === regexClass;
    	}

    	var descriptor = gOPD(value, 'lastIndex');
    	var hasLastIndexDataProperty = descriptor && src(descriptor, 'value');
    	if (!hasLastIndexDataProperty) {
    		return false;
    	}

    	return tryRegexExecCall(value);
    };

    var $TypeError$1 = GetIntrinsic('%TypeError%');
    var $SyntaxError = GetIntrinsic('%SyntaxError%');
    var $Array = GetIntrinsic('%Array%');
    var $String$1 = GetIntrinsic('%String%');
    var $Object$1 = GetIntrinsic('%Object%');
    var $Number = GetIntrinsic('%Number%');
    var $Symbol = GetIntrinsic('%Symbol%', true);
    var $RegExp = GetIntrinsic('%RegExp%');

    var hasSymbols$4 = !!$Symbol;



    var MAX_SAFE_INTEGER = $Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;





    var parseInteger = parseInt;

    var arraySlice = functionBind.call(Function.call, $Array.prototype.slice);
    var strSlice = functionBind.call(Function.call, $String$1.prototype.slice);
    var isBinary = functionBind.call(Function.call, $RegExp.prototype.test, /^0b[01]+$/i);
    var isOctal = functionBind.call(Function.call, $RegExp.prototype.test, /^0o[0-7]+$/i);
    var regexExec$1 = functionBind.call(Function.call, $RegExp.prototype.exec);
    var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
    var nonWSregex = new $RegExp('[' + nonWS + ']', 'g');
    var hasNonWS = functionBind.call(Function.call, $RegExp.prototype.test, nonWSregex);
    var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
    var isInvalidHexLiteral = functionBind.call(Function.call, $RegExp.prototype.test, invalidHexLiteral);
    var $charCodeAt = functionBind.call(Function.call, $String$1.prototype.charCodeAt);

    var toStr$8 = functionBind.call(Function.call, Object.prototype.toString);

    var $floor = Math.floor;
    var $abs = Math.abs;

    var $ObjectCreate = Object.create;
    var $gOPD = $Object$1.getOwnPropertyDescriptor;

    var $isExtensible = $Object$1.isExtensible;

    // whitespace from: http://es5.github.io/#x15.5.4.20
    // implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
    var ws = [
    	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
    	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
    	'\u2029\uFEFF'
    ].join('');
    var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
    var replace = functionBind.call(Function.call, $String$1.prototype.replace);
    var trim = function (value) {
    	return replace(value, trimRegex, '');
    };





    // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
    var ES6 = assign(assign({}, es5$1), {

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
    	Call: function Call(F, V) {
    		var args = arguments.length > 2 ? arguments[2] : [];
    		if (!this.IsCallable(F)) {
    			throw new $TypeError$1(F + ' is not a function');
    		}
    		return F.apply(V, args);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
    	ToPrimitive: es6,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
    	// ToBoolean: ES5.ToBoolean,

    	// https://ecma-international.org/ecma-262/6.0/#sec-tonumber
    	ToNumber: function ToNumber(argument) {
    		var value = isPrimitive$2(argument) ? argument : es6(argument, $Number);
    		if (typeof value === 'symbol') {
    			throw new $TypeError$1('Cannot convert a Symbol value to a number');
    		}
    		if (typeof value === 'string') {
    			if (isBinary(value)) {
    				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
    			} else if (isOctal(value)) {
    				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
    			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
    				return NaN;
    			} else {
    				var trimmed = trim(value);
    				if (trimmed !== value) {
    					return this.ToNumber(trimmed);
    				}
    			}
    		}
    		return $Number(value);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
    	// ToInteger: ES5.ToNumber,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
    	// ToInt32: ES5.ToInt32,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
    	// ToUint32: ES5.ToUint32,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
    	ToInt16: function ToInt16(argument) {
    		var int16bit = this.ToUint16(argument);
    		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
    	// ToUint16: ES5.ToUint16,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
    	ToInt8: function ToInt8(argument) {
    		var int8bit = this.ToUint8(argument);
    		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
    	ToUint8: function ToUint8(argument) {
    		var number = this.ToNumber(argument);
    		if (_isNaN(number) || number === 0 || !_isFinite(number)) { return 0; }
    		var posInt = sign(number) * $floor($abs(number));
    		return mod(posInt, 0x100);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
    	ToUint8Clamp: function ToUint8Clamp(argument) {
    		var number = this.ToNumber(argument);
    		if (_isNaN(number) || number <= 0) { return 0; }
    		if (number >= 0xFF) { return 0xFF; }
    		var f = $floor(argument);
    		if (f + 0.5 < number) { return f + 1; }
    		if (number < f + 0.5) { return f; }
    		if (f % 2 !== 0) { return f + 1; }
    		return f;
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
    	ToString: function ToString(argument) {
    		if (typeof argument === 'symbol') {
    			throw new $TypeError$1('Cannot convert a Symbol value to a string');
    		}
    		return $String$1(argument);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
    	ToObject: function ToObject(value) {
    		this.RequireObjectCoercible(value);
    		return $Object$1(value);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
    	ToPropertyKey: function ToPropertyKey(argument) {
    		var key = this.ToPrimitive(argument, $String$1);
    		return typeof key === 'symbol' ? key : this.ToString(key);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    	ToLength: function ToLength(argument) {
    		var len = this.ToInteger(argument);
    		if (len <= 0) { return 0; } // includes converting -0 to +0
    		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
    		return len;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
    	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
    		if (toStr$8(argument) !== '[object String]') {
    			throw new $TypeError$1('must be a string');
    		}
    		if (argument === '-0') { return -0; }
    		var n = this.ToNumber(argument);
    		if (this.SameValue(this.ToString(n), argument)) { return n; }
    		return void 0;
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
    	RequireObjectCoercible: es5$1.CheckObjectCoercible,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
    	IsArray: $Array.isArray || function IsArray(argument) {
    		return toStr$8(argument) === '[object Array]';
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
    	// IsCallable: ES5.IsCallable,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
    	IsConstructor: function IsConstructor(argument) {
    		return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
    	IsExtensible: Object.preventExtensions
    		? function IsExtensible(obj) {
    			if (isPrimitive$2(obj)) {
    				return false;
    			}
    			return $isExtensible(obj);
    		}
    		: function isExtensible(obj) { return true; }, // eslint-disable-line no-unused-vars

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
    	IsInteger: function IsInteger(argument) {
    		if (typeof argument !== 'number' || _isNaN(argument) || !_isFinite(argument)) {
    			return false;
    		}
    		var abs = $abs(argument);
    		return $floor(abs) === abs;
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
    	IsPropertyKey: function IsPropertyKey(argument) {
    		return typeof argument === 'string' || typeof argument === 'symbol';
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-isregexp
    	IsRegExp: function IsRegExp(argument) {
    		if (!argument || typeof argument !== 'object') {
    			return false;
    		}
    		if (hasSymbols$4) {
    			var isRegExp = argument[$Symbol.match];
    			if (typeof isRegExp !== 'undefined') {
    				return es5$1.ToBoolean(isRegExp);
    			}
    		}
    		return isRegex(argument);
    	},

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
    	// SameValue: ES5.SameValue,

    	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
    	SameValueZero: function SameValueZero(x, y) {
    		return (x === y) || (_isNaN(x) && _isNaN(y));
    	},

    	/**
    	 * 7.3.2 GetV (V, P)
    	 * 1. Assert: IsPropertyKey(P) is true.
    	 * 2. Let O be ToObject(V).
    	 * 3. ReturnIfAbrupt(O).
    	 * 4. Return O.[[Get]](P, V).
    	 */
    	GetV: function GetV(V, P) {
    		// 7.3.2.1
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    		}

    		// 7.3.2.2-3
    		var O = this.ToObject(V);

    		// 7.3.2.4
    		return O[P];
    	},

    	/**
    	 * 7.3.9 - https://ecma-international.org/ecma-262/6.0/#sec-getmethod
    	 * 1. Assert: IsPropertyKey(P) is true.
    	 * 2. Let func be GetV(O, P).
    	 * 3. ReturnIfAbrupt(func).
    	 * 4. If func is either undefined or null, return undefined.
    	 * 5. If IsCallable(func) is false, throw a TypeError exception.
    	 * 6. Return func.
    	 */
    	GetMethod: function GetMethod(O, P) {
    		// 7.3.9.1
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    		}

    		// 7.3.9.2
    		var func = this.GetV(O, P);

    		// 7.3.9.4
    		if (func == null) {
    			return void 0;
    		}

    		// 7.3.9.5
    		if (!this.IsCallable(func)) {
    			throw new $TypeError$1(P + 'is not a function');
    		}

    		// 7.3.9.6
    		return func;
    	},

    	/**
    	 * 7.3.1 Get (O, P) - https://ecma-international.org/ecma-262/6.0/#sec-get-o-p
    	 * 1. Assert: Type(O) is Object.
    	 * 2. Assert: IsPropertyKey(P) is true.
    	 * 3. Return O.[[Get]](P, O).
    	 */
    	Get: function Get(O, P) {
    		// 7.3.1.1
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    		}
    		// 7.3.1.2
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    		}
    		// 7.3.1.3
    		return O[P];
    	},

    	Type: function Type(x) {
    		if (typeof x === 'symbol') {
    			return 'Symbol';
    		}
    		return es5$1.Type(x);
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
    	SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    		}
    		var C = O.constructor;
    		if (typeof C === 'undefined') {
    			return defaultConstructor;
    		}
    		if (this.Type(C) !== 'Object') {
    			throw new $TypeError$1('O.constructor is not an Object');
    		}
    		var S = hasSymbols$4 && $Symbol.species ? C[$Symbol.species] : void 0;
    		if (S == null) {
    			return defaultConstructor;
    		}
    		if (this.IsConstructor(S)) {
    			return S;
    		}
    		throw new $TypeError$1('no constructor found');
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-completepropertydescriptor
    	CompletePropertyDescriptor: function CompletePropertyDescriptor(Desc) {
    		if (!this.IsPropertyDescriptor(Desc)) {
    			throw new $TypeError$1('Desc must be a Property Descriptor');
    		}

    		if (this.IsGenericDescriptor(Desc) || this.IsDataDescriptor(Desc)) {
    			if (!src(Desc, '[[Value]]')) {
    				Desc['[[Value]]'] = void 0;
    			}
    			if (!src(Desc, '[[Writable]]')) {
    				Desc['[[Writable]]'] = false;
    			}
    		} else {
    			if (!src(Desc, '[[Get]]')) {
    				Desc['[[Get]]'] = void 0;
    			}
    			if (!src(Desc, '[[Set]]')) {
    				Desc['[[Set]]'] = void 0;
    			}
    		}
    		if (!src(Desc, '[[Enumerable]]')) {
    			Desc['[[Enumerable]]'] = false;
    		}
    		if (!src(Desc, '[[Configurable]]')) {
    			Desc['[[Configurable]]'] = false;
    		}
    		return Desc;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-set-o-p-v-throw
    	Set: function Set(O, P, V, Throw) {
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('O must be an Object');
    		}
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('P must be a Property Key');
    		}
    		if (this.Type(Throw) !== 'Boolean') {
    			throw new $TypeError$1('Throw must be a Boolean');
    		}
    		if (Throw) {
    			O[P] = V;
    			return true;
    		} else {
    			try {
    				O[P] = V;
    			} catch (e) {
    				return false;
    			}
    		}
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-hasownproperty
    	HasOwnProperty: function HasOwnProperty(O, P) {
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('O must be an Object');
    		}
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('P must be a Property Key');
    		}
    		return src(O, P);
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-hasproperty
    	HasProperty: function HasProperty(O, P) {
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('O must be an Object');
    		}
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('P must be a Property Key');
    		}
    		return P in O;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-isconcatspreadable
    	IsConcatSpreadable: function IsConcatSpreadable(O) {
    		if (this.Type(O) !== 'Object') {
    			return false;
    		}
    		if (hasSymbols$4 && typeof $Symbol.isConcatSpreadable === 'symbol') {
    			var spreadable = this.Get(O, Symbol.isConcatSpreadable);
    			if (typeof spreadable !== 'undefined') {
    				return this.ToBoolean(spreadable);
    			}
    		}
    		return this.IsArray(O);
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-invoke
    	Invoke: function Invoke(O, P) {
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('P must be a Property Key');
    		}
    		var argumentsList = arraySlice(arguments, 2);
    		var func = this.GetV(O, P);
    		return this.Call(func, O, argumentsList);
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-getiterator
    	GetIterator: function GetIterator(obj, method) {
    		if (!hasSymbols$4) {
    			throw new SyntaxError('ES.GetIterator depends on native iterator support.');
    		}

    		var actualMethod = method;
    		if (arguments.length < 2) {
    			actualMethod = this.GetMethod(obj, $Symbol.iterator);
    		}
    		var iterator = this.Call(actualMethod, obj);
    		if (this.Type(iterator) !== 'Object') {
    			throw new $TypeError$1('iterator must return an object');
    		}

    		return iterator;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-iteratornext
    	IteratorNext: function IteratorNext(iterator, value) {
    		var result = this.Invoke(iterator, 'next', arguments.length < 2 ? [] : [value]);
    		if (this.Type(result) !== 'Object') {
    			throw new $TypeError$1('iterator next must return an object');
    		}
    		return result;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-iteratorcomplete
    	IteratorComplete: function IteratorComplete(iterResult) {
    		if (this.Type(iterResult) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(iterResult) is not Object');
    		}
    		return this.ToBoolean(this.Get(iterResult, 'done'));
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-iteratorvalue
    	IteratorValue: function IteratorValue(iterResult) {
    		if (this.Type(iterResult) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(iterResult) is not Object');
    		}
    		return this.Get(iterResult, 'value');
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-iteratorstep
    	IteratorStep: function IteratorStep(iterator) {
    		var result = this.IteratorNext(iterator);
    		var done = this.IteratorComplete(result);
    		return done === true ? false : result;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-iteratorclose
    	IteratorClose: function IteratorClose(iterator, completion) {
    		if (this.Type(iterator) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(iterator) is not Object');
    		}
    		if (!this.IsCallable(completion)) {
    			throw new $TypeError$1('Assertion failed: completion is not a thunk for a Completion Record');
    		}
    		var completionThunk = completion;

    		var iteratorReturn = this.GetMethod(iterator, 'return');

    		if (typeof iteratorReturn === 'undefined') {
    			return completionThunk();
    		}

    		var completionRecord;
    		try {
    			var innerResult = this.Call(iteratorReturn, iterator, []);
    		} catch (e) {
    			// if we hit here, then "e" is the innerResult completion that needs re-throwing

    			// if the completion is of type "throw", this will throw.
    			completionRecord = completionThunk();
    			completionThunk = null; // ensure it's not called twice.

    			// if not, then return the innerResult completion
    			throw e;
    		}
    		completionRecord = completionThunk(); // if innerResult worked, then throw if the completion does
    		completionThunk = null; // ensure it's not called twice.

    		if (this.Type(innerResult) !== 'Object') {
    			throw new $TypeError$1('iterator .return must return an object');
    		}

    		return completionRecord;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-createiterresultobject
    	CreateIterResultObject: function CreateIterResultObject(value, done) {
    		if (this.Type(done) !== 'Boolean') {
    			throw new $TypeError$1('Assertion failed: Type(done) is not Boolean');
    		}
    		return {
    			value: value,
    			done: done
    		};
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-regexpexec
    	RegExpExec: function RegExpExec(R, S) {
    		if (this.Type(R) !== 'Object') {
    			throw new $TypeError$1('R must be an Object');
    		}
    		if (this.Type(S) !== 'String') {
    			throw new $TypeError$1('S must be a String');
    		}
    		var exec = this.Get(R, 'exec');
    		if (this.IsCallable(exec)) {
    			var result = this.Call(exec, R, [S]);
    			if (result === null || this.Type(result) === 'Object') {
    				return result;
    			}
    			throw new $TypeError$1('"exec" method must return `null` or an Object');
    		}
    		return regexExec$1(R, S);
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-arrayspeciescreate
    	ArraySpeciesCreate: function ArraySpeciesCreate(originalArray, length) {
    		if (!this.IsInteger(length) || length < 0) {
    			throw new $TypeError$1('Assertion failed: length must be an integer >= 0');
    		}
    		var len = length === 0 ? 0 : length;
    		var C;
    		var isArray = this.IsArray(originalArray);
    		if (isArray) {
    			C = this.Get(originalArray, 'constructor');
    			// TODO: figure out how to make a cross-realm normal Array, a same-realm Array
    			// if (this.IsConstructor(C)) {
    			// 	if C is another realm's Array, C = undefined
    			// 	Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Array))) === null ?
    			// }
    			if (this.Type(C) === 'Object' && hasSymbols$4 && $Symbol.species) {
    				C = this.Get(C, $Symbol.species);
    				if (C === null) {
    					C = void 0;
    				}
    			}
    		}
    		if (typeof C === 'undefined') {
    			return $Array(len);
    		}
    		if (!this.IsConstructor(C)) {
    			throw new $TypeError$1('C must be a constructor');
    		}
    		return new C(len); // this.Construct(C, len);
    	},

    	CreateDataProperty: function CreateDataProperty(O, P, V) {
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    		}
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    		}
    		var oldDesc = $gOPD(O, P);
    		var extensible = oldDesc || (typeof $isExtensible !== 'function' || $isExtensible(O));
    		var immutable = oldDesc && (!oldDesc.writable || !oldDesc.configurable);
    		if (immutable || !extensible) {
    			return false;
    		}
    		var newDesc = {
    			configurable: true,
    			enumerable: true,
    			value: V,
    			writable: true
    		};
    		Object.defineProperty(O, P, newDesc);
    		return true;
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-createdatapropertyorthrow
    	CreateDataPropertyOrThrow: function CreateDataPropertyOrThrow(O, P, V) {
    		if (this.Type(O) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: Type(O) is not Object');
    		}
    		if (!this.IsPropertyKey(P)) {
    			throw new $TypeError$1('Assertion failed: IsPropertyKey(P) is not true');
    		}
    		var success = this.CreateDataProperty(O, P, V);
    		if (!success) {
    			throw new $TypeError$1('unable to create data property');
    		}
    		return success;
    	},

    	// https://www.ecma-international.org/ecma-262/6.0/#sec-objectcreate
    	ObjectCreate: function ObjectCreate(proto, internalSlotsList) {
    		if (proto !== null && this.Type(proto) !== 'Object') {
    			throw new $TypeError$1('Assertion failed: proto must be null or an object');
    		}
    		var slots = arguments.length < 2 ? [] : internalSlotsList;
    		if (slots.length > 0) {
    			throw new $SyntaxError('es-abstract does not yet support internal slots');
    		}

    		if (proto === null && !$ObjectCreate) {
    			throw new $SyntaxError('native Object.create support is required to create null objects');
    		}

    		return $ObjectCreate(proto);
    	},

    	// https://ecma-international.org/ecma-262/6.0/#sec-advancestringindex
    	AdvanceStringIndex: function AdvanceStringIndex(S, index, unicode) {
    		if (this.Type(S) !== 'String') {
    			throw new $TypeError$1('S must be a String');
    		}
    		if (!this.IsInteger(index) || index < 0 || index > MAX_SAFE_INTEGER) {
    			throw new $TypeError$1('Assertion failed: length must be an integer >= 0 and <= 2**53');
    		}
    		if (this.Type(unicode) !== 'Boolean') {
    			throw new $TypeError$1('Assertion failed: unicode must be a Boolean');
    		}
    		if (!unicode) {
    			return index + 1;
    		}
    		var length = S.length;
    		if ((index + 1) >= length) {
    			return index + 1;
    		}

    		var first = $charCodeAt(S, index);
    		if (first < 0xD800 || first > 0xDBFF) {
    			return index + 1;
    		}

    		var second = $charCodeAt(S, index + 1);
    		if (second < 0xDC00 || second > 0xDFFF) {
    			return index + 1;
    		}

    		return index + 2;
    	}
    });

    delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

    var es2015$1 = ES6;

    var es6$1 = es2015$1;

    var supportsDescriptors$1 = defineProperties_1.supportsDescriptors;

    /*! https://mths.be/array-from v0.2.0 by @mathias */
    var implementation$1 = function from(arrayLike) {
    	var defineProperty = supportsDescriptors$1 ? Object.defineProperty : function put(object, key, descriptor) {
    		object[key] = descriptor.value;
    	};
    	var C = this;
    	if (arrayLike === null || typeof arrayLike === 'undefined') {
    		throw new TypeError('`Array.from` requires an array-like object, not `null` or `undefined`');
    	}
    	var items = es6$1.ToObject(arrayLike);

    	var mapFn, T;
    	if (typeof arguments[1] !== 'undefined') {
    		mapFn = arguments[1];
    		if (!es6$1.IsCallable(mapFn)) {
    			throw new TypeError('When provided, the second argument to `Array.from` must be a function');
    		}
    		if (arguments.length > 2) {
    			T = arguments[2];
    		}
    	}

    	var len = es6$1.ToLength(items.length);
    	var A = es6$1.IsCallable(C) ? es6$1.ToObject(new C(len)) : new Array(len);
    	var k = 0;
    	var kValue, mappedValue;
    	while (k < len) {
    		kValue = items[k];
    		if (mapFn) {
    			mappedValue = typeof T === 'undefined' ? mapFn(kValue, k) : es6$1.Call(mapFn, T, [kValue, k]);
    		} else {
    			mappedValue = kValue;
    		}
    		defineProperty(A, k, {
    			'configurable': true,
    			'enumerable': true,
    			'value': mappedValue,
    			'writable': true
    		});
    		k += 1;
    	}
    	A.length = len;
    	return A;
    };

    var tryCall = function (fn) {
    	try {
    		fn();
    		return true;
    	} catch (e) {
    		return false;
    	}
    };

    var polyfill = function getPolyfill() {
    	var implemented = es6$1.IsCallable(Array.from)
    		&& tryCall(function () { })
    		&& !tryCall(function () { });

    	return implemented ? Array.from : implementation$1;
    };

    var shim = function shimArrayFrom() {
    	var polyfill$$1 = polyfill();

    	defineProperties_1(Array, { 'from': polyfill$$1 }, {
    		'from': function () {
    			return Array.from !== polyfill$$1;
    		}
    	});

    	return polyfill$$1;
    };

    // eslint-disable-next-line no-unused-vars
    var boundFromShim = function from(array) {
        // eslint-disable-next-line no-invalid-this
    	return implementation$1.apply(this || Array, arguments);
    };

    defineProperties_1(boundFromShim, {
    	'getPolyfill': polyfill,
    	'implementation': implementation$1,
    	'shim': shim
    });

    var load = (function (db) {
      return function (_id) {
        return db.get(_id).catch(function (err) {
          if (err.status === 404) {
            return { _id: _id };
          } else {
            throw err;
          }
        }).catch(console.error.bind(console));
      };
    });

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var unpersistedQueue = {};
    var isUpdating = {};

    var save = (function (db, madeBy) {
      var loadReducer = load(db);

      var saveReducer = function saveReducer(reducerName, reducerState) {
        if (isUpdating[reducerName]) {
          //enqueue promise
          unpersistedQueue[reducerName] = unpersistedQueue[reducerName] || [];
          unpersistedQueue[reducerName].push(reducerState);

          return Promise.resolve();
        }

        isUpdating[reducerName] = true;

        return loadReducer(reducerName).then(function (doc) {
          var newDoc = _extends({}, doc, { madeBy: madeBy, state: reducerState });
          return newDoc;
        }).then(function (newDoc) {
          return db.put(newDoc);
        }).then(function () {
          isUpdating[reducerName] = false;
          if (unpersistedQueue[reducerName] && unpersistedQueue[reducerName].length) {
            var next = unpersistedQueue[reducerName].shift();

            return saveReducer(reducerName, next);
          }
        }).catch(console.error.bind(console));
      };

      return saveReducer;
    });

    var SET_REDUCER = 'redux-pouchdb/SET_REDUCER';
    var INIT = '@@redux-pouchdb/INIT';

    var LOCAL_IDENTIFIER = Array(12).fill(0).map(function (_) {
      return String.fromCharCode(function (x) {
        return x > 25 ? x + 71 : x + 65;
      }(Math.floor(Math.random() * 52)));
    }).join('');

    var saveReducer = void 0;
    var isInitialized = false;
    var persistentStore = function persistentStore(db) {
      var onChange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      return function (storeCreator) {
        return function (reducer, initialState) {

          var store = storeCreator(reducer, initialState);

          saveReducer = save(db, LOCAL_IDENTIFIER);

          if (!Array.isArray(onChange)) {
            onChange = [onChange];
          }

          var setReducer = function setReducer(doc) {
            var _id = doc._id,
                _rev = doc._rev,
                state = doc.state;


            store.dispatch({
              type: SET_REDUCER,
              reducer: _id,
              state: state,
              _rev: _rev
            });

            onChange.forEach(function (fn) {
              var result = fn(doc);
              if (result) {
                store.dispatch(result);
              }
            });
          };

          db.allDocs({ include_docs: true }).then(function (res) {
            var promises = res.rows.map(function (row) {
              return setReducer(row.doc);
            });
            return Promise.all(promises);
          }).then(function () {
            isInitialized = true;
            store.dispatch({
              type: INIT
            });

            return db.changes({
              include_docs: true,
              live: true,
              since: 'now'
            }).on('change', function (change) {
              if (change.doc.state && change.doc.madeBy !== LOCAL_IDENTIFIER) {
                setReducer(change.doc);
              }
            });
          }).catch(console.error.bind(console));

          return store;
        };
      };
    };

    var persistentReducer = function persistentReducer(reducer, name) {
      var lastState = void 0;
      name = name || reducer.name || Math.random().toString();

      return function (state, action) {
        if (action.type === SET_REDUCER && action.reducer === name && action.state) {

          lastState = action.state;
          return reducer(action.state, action);
        }
        if (action.type === SET_REDUCER) {
          // Another reducer's state... ignore.
          return state;
        }

        var reducedState = reducer(state, action);
        if (isInitialized && !deepEqual_1(reducedState, lastState)) {
          lastState = reducedState;
          saveReducer(name, reducedState);
        }

        return reducedState;
      };
    };

    // import { persistentReducer } from 'redux-pouchdb-plus';
    // import { persistentStore } from 'redux-pouchdb-plus';



    // let dbChoice = 1;
    // const db = (reducerName, store, additionalOptions) => {
    //   if (dbChoice === 1)
    //     return new PouchDB('dbname1');
    //   else
    //     return new PouchDB('dbname2');
    // }

    function storeCreator$1(theuser, initialState, db) {
        console.log('theuser!');
        console.log(theuser);
        // let username;

        // if (theuser.currentUser.email == 'ahell@kth.se') {
        //     username = 'ahell';
        // } else {
        //     username = 'ohej';
        // }
        
        // let db = new PouchDB(username);
        
        // var couchDB = new PouchDB(`http://plex:1111111111@127.0.0.1:5984/${username}`);
        
        
        // db
        // .replicate
        // .from(couchDB)
        // .on('complete', (info) => {   
        //     db.sync(couchDB, { live: true, retry: true })
        //     console.log('info');
        //     console.log(info); 
        // })
        // .on('error', (info) => {
        //     console.log('error');
        //     console.log(info);
        // })
        // .on('change', (info) => {
        //     console.log('change');
        //     console.log(info);
        // });


        // console.log(db);
        // db.allDocs({
        //     include_docs: true,
        //     attachments: true
        //   }).then(function (result) {
        //     console.log(result);
        //   }).catch(function (err) {
        //     console.log(err);
        //   });
        
        
        var logger = reduxLogger.logger;
        
        const applyMiddlewares = Redux.applyMiddleware(
            logger
          );
        
        const createStoreWithMiddleware = Redux.compose(
            applyMiddlewares,
            persistentStore(db)
        )(Redux.createStore);
        

        
        // let initialState = {
        //     one: 74,
        //     two: 47
        // }
        
        
        function counter(state, action) {
            switch (action.type) {
            case 'ONE_INCREMENT':
                return {...state, one: state.one + 1}
            case 'TWO_INCREMENT':
                return {...state, two: state.two + 1}
            default:
                return state
            }
        }


        console.log('INITIAL STATE');
        console.log(initialState);
        
        const store = createStoreWithMiddleware(persistentReducer(counter, theuser), initialState);

        return store;
    }

    const ONE_INCREMENT = 'ONE_INCREMENT';

    const oneincrement = () => {
        return {
          type: ONE_INCREMENT
        };
      };




    class XLoggedin extends LitElement {
        connectedCallback() {
            super.connectedCallback();
            let that = this;
            this.username;
            if (firebase.auth().currentUser.email == 'ahell@kth.se') {
            this.username = 'ahell';
            } else {
                this.username = 'ohej';
            }
            this.db = new PouchDB(this.username);
            this.db.allDocs({
            include_docs: true,
            attachments: true
            }).then(function (result) {
                console.log('RESULT');
                console.log(result);
                let initState = null;
                if (result.rows.length) {
                    initState = result.rows[0].doc.state;
                } else {
                    initState = {
                    one: 74,
                    two: 47
                    };
                }

                console.log('INIT STATE TO STORE CREATOR');
                console.log(initState);

                that.store = storeCreator$1(that.username, initState, that.db);
                that.__storeUnsubscribe = that.store.subscribe(() => that._stateChanged(that.store.getState()));
                console.log(that.store);
            // // that.store.subscribe(() => that._stateChanged(that.store.getState()));
            // // that._stateChanged(that.store.getState());
            // }
            

            
            }).catch(function (err) {
            console.log(err);
            });

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {      
                    console.log('User Logged In');
                } else {
                    that.__storeUnsubscribe();
                    console.log('UNSUBSCRIBED');
                }
            });
        }

        disconnectedCallback() {
            this.db = null;
            this.store = null;
            this.__storeUnsubscribe();
        
            if (super.disconnectedCallback) {
              super.disconnectedCallback();
            }
          }

        static get properties() {
            return {
                counter: {type: String},
                checked: {type: String}
            };
        }

        constructor() {
            super();
            this.checked = 1;
        }

        render() {
            console.log('new render');



            return html`
        <style>
            .bg {
                background-color: green;
                width: 100vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
            .left {
                background-color: orange;
                width: 80vw;
                height: 90vh;
                /* display: flex;
                align-items: center;
                justify-content: center; */
            }
            .left {
                background-color: blue;
                width: 20vw;
                height: 90vh;
                /* display: flex;
                align-items: center;
                justify-content: center; */
            }
        </style>
        <div class="bg">
            <div class="left">
                <x-radiogroup @selected-changed=${this.onSelectedChanged.bind(this)}>
                    <vaadin-radio-button name="1">1</vaadin-radio-button>
                    <vaadin-radio-button name="2">2</vaadin-radio-button>
                    <vaadin-radio-button name="3">3</vaadin-radio-button>
                    <vaadin-radio-button name="4">4</vaadin-radio-button>
                </x-radiogroup>
                <vaadin-checkbox @checked-changed=${this.onCheckboxChanged.bind(this)}>${this.counter}</vaadin-checkbox>
            </div>
            <div class="right">
                <slot></slot>
            </div> 
        </div>
        `
        }

        _stateChanged(state) {
            console.log('stateChanged');
            console.log(state);
            this.counter = state.one;
        }

        onCheckboxChanged(e) {
            try {
                this.store.dispatch(oneincrement());
            } catch(error) {

            }
            
        }
        onSelectedChanged(e) {
            console.log('SELECTED CHANGED');
            console.log(e);
            if(e.detail.selected == 1) {
                Router.go('/user/one');
            }
            if(e.detail.selected == 2) {
                Router.go('/user/two');
            }
            if(e.detail.selected == 3) {
                Router.go('/user/three');
            }
            if(e.detail.selected == 4) {
                Router.go('/user/four');
            }
        }

        // onClick(e) {
        //     // store.dispatch(oneincrement());
        //     console.log(e);
        //     console.log('this');
        //     console.log(this);
            

        // }

        // _clickHandler(e) {
        //     console.log('CLICKED');
        //     console.log(e.detail);

        //     if(e.detail.value) {
        //         this.checked = e.path[0].id;
        //     }
            
        //     // console.log(this.shadowRoot.querySelector('#foo'));

        // }
    }

    customElements.define('x-loggedin', XLoggedin);   

    // function XLoggedinCreator(theuser) {
        
    // }


            // const items = [1, 2, 3];
            // const buttons = html`${items.map((i) => {
            //     if (i == this.checked) {
            //         console.log(`${i}: checked!`);
            //         return html`<vaadin-radio-button id="${i}" checked @checked-changed=${this._clickHandler.bind(this)}>${i}</vaadin-radio-button>`
            //     } else {
            //         return html`<vaadin-radio-button id="${i}" @checked-changed=${this._clickHandler.bind(this)}>${i}</vaadin-radio-button>`
            //     }
                
            // })}`;



            // const buttonsX = html`
            //     <vaadin-checkbox id="foo" name="foo" ?checked=${this.foochecked} @checked-changed=${this._clickHandler.bind(this)}>Foo</vaadin-checkbox>
            //     <vaadin-radio-button id="bar" name="bar" ?checked=${this.barchecked} @checked-changed=${this.onClick.bind(this)}>Bar</vaadin-radio-button>
            //     <vaadin-radio-button id="baz" name="baz" ?checked=${this.bazchecked} @checked-changed=${this.onClick.bind(this)}>Baz</vaadin-radio-button> 
            // `

    class XLogout extends LitElement {
        render() {
            return html`
        <style>
            /* .bg {
                background-color: grey;
                width: 40vw;
                height: 8vh;
                display: flex;
                align-items: center;
                justify-content: center;
            } */
        </style>
        <whcg-button @click=${this.onClick.bind(this)}>LOGOUT</whcg-button>
        <!-- <div class="bg">
            
        </div> -->
        `
        }

        onClick(e) {
            firebase.auth().signOut().then(function() {
                console.log('Sign-out successful');
              }).catch(function(error) {
                console.log('Error Signing Out');
              });
        }

        onGreen(e) {
            Router.go('/user/green');
        }
    }

    customElements.define('x-logout', XLogout);

    const grid = html`<style>
      .col1span1 {
        grid-column: col-start 1 / span 1;
      }

      .col1span2 {
        grid-column: col-start 1 / span 2;
      }

      .col1span3 {
        grid-column: col-start 1 / span 3;
      }

      .col1span4 {
        grid-column: col-start 1 / span 4;
      }

      .col1span5 {
        grid-column: col-start 1 / span 5;
      }

      .col1span6 {
        grid-column: col-start 1 / span 6;
      }

      .col1span7 {
        grid-column: col-start 1 / span 7;
      }

      .col1span8 {
        grid-column: col-start 1 / span 8;
      }

      .col1span9 {
          grid-column: col-start 1 / span 9;
      }

      .col1span10 {
        grid-column: col-start 1 / span 10;
      }

      .col1span11 {
        grid-column: col-start 1 / span 11;
      }

      .col1span12 {
          grid-column: col-start 1 / span 12;
      }
      
      .col2span1 {
        grid-column: col-start 2 / span 1;
      }

      .col2span2 {
        grid-column: col-start 2 / span 2;
      }

      .col2span3 {
        grid-column: col-start 2 / span 3;
      }

      .col2span4 {
        grid-column: col-start 2 / span 4;
      }

      ::slotted(.col2span4) {
          grid-column: col-start 2 / span 4;
      }

      .col2span5 {
        grid-column: col-start 2 / span 5;
      }

      .col2span6 {
        grid-column: col-start 2 / span 6;
      }

      .col2span7 {
        grid-column: col-start 2 / span 7;
      }


      .col2span8 {
        grid-column: col-start 2 / span 8;
      }

      .col2span9 {
        grid-column: col-start 2 / span 9;
      }

      .col2span10 {
        grid-column: col-start 2 / span 10;
      }


      .col2span11 {
        grid-column: col-start 2 / span 11;
      }


      .col3span1 {
        grid-column: col-start 3 / span 1;
      }


      .col3span2 {
        grid-column: col-start 3 / span 2;
      }

      .col3span3 {
        grid-column: col-start 3 / span 3;
      }

      .col3span4 {
        grid-column: col-start 3 / span 4;
      }


      .col3span5 {
        grid-column: col-start 3 / span 5;
      }

      .col3span6 {
        grid-column: col-start 3 / span 6;
      }

      .col3span7 {
        grid-column: col-start 3 / span 7;
      }


      .col3span8 {
        grid-column: col-start 3 / span 8;
      }

      .col3span9 {
        grid-column: col-start 3 / span 9;
      }

      .col3span10 {
        grid-column: col-start 3 / span 10;
      }

      .col4span1 {
        grid-column: col-start 4 / span 1;
      }

      .col4span2 {
        grid-column: col-start 4 / span 2;
      }

      .col4span3 {
        grid-column: col-start 4 / span 3;
      }

      .col4span4 {
        grid-column: col-start 4 / span 4;
      }


      .col4span5 {
        grid-column: col-start 4 / span 5;
      }

      .col4span6 {
        grid-column: col-start 4 / span 6;
      }

      .col4span7 {
        grid-column: col-start 4 / span 7;
      }


      .col4span8 {
        grid-column: col-start 4 / span 8;
      }

      .col4span9 {
        grid-column: col-start 4 / span 9;
      }

      
      .col5span1 {
        grid-column: col-start 5 / span 1;
      }

      .col5span2 {
        grid-column: col-start 5 / span 2;
      }

      .col5span3 {
        grid-column: col-start 5 / span 3;
      }

      .col5span4 {
        grid-column: col-start 5 / span 4;
      }


      .col5span5 {
        grid-column: col-start 5 / span 5;
      }

      .col5span6 {
        grid-column: col-start 5 / span 6;
      }

      .col5span7 {
        grid-column: col-start 5 / span 7;
      }


      .col5span8 {
        grid-column: col-start 5 / span 8;
      }

      .col6span1 {
        grid-column: col-start 6 / span 1;
      }

      .col6span2 {
        grid-column: col-start 6 / span 2;
      }

      .col6span3 {
        grid-column: col-start 6 / span 3;
      }

      .col6span4 {
        grid-column: col-start 6 / span 4;
      }


      .col6span5 {
        grid-column: col-start 6 / span 5;
      }

      .col6span6 {
        grid-column: col-start 6 / span 6;
      }

      .col6span7 {
        grid-column: col-start 6 / span 7;
      }


      .col7span1 {
        grid-column: col-start 7 / span 1;
      }

      .col7span2 {
        grid-column: col-start 7 / span 2;
      }

      .col7span3 {
        grid-column: col-start 7 / span 3;
      }

      .col7span4 {
        grid-column: col-start 7 / span 4;
      }


      .col7span5 {
        grid-column: col-start 7 / span 5;
      }

      .col7span6 {
        grid-column: col-start 7 / span 6;
      }

      .col8span1 {
        grid-column: col-start 8 / span 1;
      }

      .col8span2 {
        grid-column: col-start 8 / span 2;
      }

      .col8span3 {
        grid-column: col-start 8 / span 3;
      }

      .col8span4 {
        grid-column: col-start 8 / span 4;
      }

      ::slotted(.col8span4) {
        grid-column: col-start 8 / span 4;
      }


      .col8span5 {
        grid-column: col-start 8 / span 5;
      }

      .col9span1 {
        grid-column: col-start 9 / span 1;
      }

      .col9span2 {
        grid-column: col-start 9 / span 2;
      }

      .col9span3 {
        grid-column: col-start 9 / span 3;
      }

      .col9span4 {
        grid-column: col-start 9 / span 4;
      }


      .col10span1 {
        grid-column: col-start 10 / span 1;
      }

      .col10span2 {
        grid-column: col-start 10 / span 2;
      }

      .col10span3 {
        grid-column: col-start 10 / span 3;
      }


      .col11span1 {
        grid-column: col-start 11 / span 1;
      }

      .col11span2 {
        grid-column: col-start 11 / span 2;
      }

      .col12span1 {
        grid-column: col-start 12 / span 1;
      }

      .grid-1 {
        display: grid;
        grid-template-columns: repeat(1, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-3 {
        display: grid;
        grid-template-columns: repeat(3, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-4 {
        display: grid;
        grid-template-columns: repeat(4, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-5 {
        display: grid;
        grid-template-columns: repeat(5, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-6 {
        display: grid;
        grid-template-columns: repeat(6, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-7 {
        display: grid;
        grid-template-columns: repeat(7, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-8 {
        display: grid;
        grid-template-columns: repeat(8, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-9 {
        display: grid;
        grid-template-columns: repeat(9, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-10 {
        display: grid;
        grid-template-columns: repeat(10, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-11 {
        display: grid;
        grid-template-columns: repeat(11, [col-start] 1fr);
        grid-gap: 20px;
      }

      .grid-12 {
        display: grid;
        grid-template-columns: repeat(12, [col-start] 1fr);
        grid-gap: 20px;
      }

      :host(.grid-12) {
        display: grid;
        grid-template-columns: repeat(12, [col-start] 1fr);
        grid-gap: 20px;
      }
  </style>`;

    class WhcgHeader extends LitElement {
        render() {
            return html `
        ${grid}
        <style>
            :host {
                padding-top: var(--whcg-header-host-padding-top);
                padding-bottom: var(--whcg-header-host-padding-bottom);
                align-items: center;
            }

            ::slotted(.icon) {
                --iron-icon-width: 268px;
                --iron-icon-height: 85px;
                width: var(--iron-icon-width);
                height: var(--iron-icon-height);
            }

            ::slotted([slot=right]) {
                justify-self: end;
            } 
        </style>  
        <slot name='left'></slot>
        <slot name='right'></slot>
    `;
        }
    }

    window.customElements.define('whcg-header', WhcgHeader);

    class WhcgButtonBox extends LitElement {
        static get properties() {
            return {
              userobj: {type: Object}
            };
          }
        
          firstUpdated() {
            let that = this;
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    console.log('IN FROM RENDER');
                    console.log(this);
                    that.userobj = {...user};
                    
                } else {
                    console.log('OUT FROM RENDER');
                    console.log(this);
                    that.userobj = {...user};
                }
            });
          }

        render() {
            return html `
        <style>
            whcg-button {
                padding-left: 10px;
            }

        </style>
            ${firebase.auth().currentUser
                ? html`<x-logout></x-logout>`
                : html`<x-login></x-login>`
            }
            
    `;
        }

    }

    window.customElements.define('whcg-button-box', WhcgButtonBox);

    class XRoot extends LitElement {
        
        render() {       
            return html`
        <style>
            .container {
                background-color: orange;
                width: 100vw;
            }

            .main {
                background-color: yellow;
                width: 100vw;
                height: 90vh;
            }

            .sidebar {
                background-color: blue;
                width: 20vw;
                height: 90vh;
            }
        </style>
        <div class="container">
            <whcg-header class="grid-12">
                <iron-icon slot="left" icon="parmaco-set:logo-crop" class="icon col2span4"></iron-icon>
                <whcg-button-box slot="right" class="col8span4"></whcg-button-box>
            </whcg-header>
            <slot></slot>
        </div>
        `
        }
    }

    customElements.define('x-root', XRoot);

    class XOne extends LitElement {


        render() {
            console.log('new render');



            return html`
        <style>
            .bg {
                background-color: black;
                width: 80vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
           
        </style>
        <div class="bg">
        </div>
        `
        }  

    }

    customElements.define('x-one', XOne);

    class XTwo extends LitElement {

        render() {
            console.log('new render');

            return html`
        <style>
            .bg {
                background-color: purple;
                width: 80vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
           
        </style>
        <div class="bg">
        </div>
        `
        }  

    }

    customElements.define('x-two', XTwo);

    class XThree extends LitElement {

        render() {
            console.log('new render');

            return html`
        <style>
            .bg {
                background-color: brown;
                width: 80vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
           
        </style>
        <div class="bg">
        </div>
        `
        }  

    }

    customElements.define('x-three', XThree);

    class XFour extends LitElement {

        render() {
            console.log('new render');

            return html`
        <style>
            .bg {
                background-color: lime;
                width: 80vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
           
        </style>
        <div class="bg">
        </div>
        `
        }  
    }

    customElements.define('x-four', XFour);

    class MyApp extends usermixin(LitElement) {
        firstUpdated() {
            const outlet = this.shadowRoot.querySelector('#outlet');
            const router = new Router(outlet);

              router.setRoutes([
                {path: '/', 
                    component: 'x-root',
                    children: [
                        {path: '/', action: this.rootAction.bind(this)},
                        {path: '/user', 
                            action: this.userAction.bind(this),
                            children: [
                                {path: '/', action: this.menuOneAction.bind(this)},
                                {path: '/one', action: this.menuOneAction.bind(this)},
                                {path: '/two', action: this.menuTwoAction.bind(this)},
                                {path: '/three', action: this.menuThreeAction.bind(this)},
                                {path: '/four', action: this.menuFourAction.bind(this)},
                            ]},
                        
                    ]},
              ]);
        }

        render() {
            return html`
        <div id="outlet"></div>
        `
        }

        rootAction(context, commands) {
            if(this.user.currentUser) {
                return commands.redirect('/');
            } else {
                const loggedOutElement = commands.component('x-loggedout');
                return loggedOutElement;
            }   
        }
        
        userAction(context, commands) {
            if(this.user.currentUser) {
                // try {
                //     customElements.define('x-loggedin', XLoggedinCreator(this.user));   
                // } catch(error) {
                //     console.error(error);
                // }

                const loggedinElement = commands.component('x-loggedin');
                return loggedinElement;
            } else {
                return commands.redirect('/');
            }   
        }

        menuOneAction(context, commands) {
            console.log('MENUACTION');
            const loggedinElement = commands.component('x-one');
            return loggedinElement;
        }

        menuTwoAction(context, commands) {
            console.log('MENUACTION');
            const loggedinElement = commands.component('x-two');
            return loggedinElement;
        }

        menuThreeAction(context, commands) {
            console.log('MENUACTION');
            const loggedinElement = commands.component('x-three');
            return loggedinElement;
        }

        menuFourAction(context, commands) {
            console.log('MENUACTION');
            const loggedinElement = commands.component('x-four');
            return loggedinElement;
        }

        
    }

    customElements.define('my-app', MyApp);

    exports.MyApp = MyApp;

    return exports;

}({}));
