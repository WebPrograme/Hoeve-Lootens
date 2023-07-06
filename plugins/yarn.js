// Global variables

let globalVariables = {};

// Classes

class Toast {
    constructor(toastText, toastType, toastPosition = 'bottom') {
        this.toastID = Math.random().toString(36).substr(2, 9);
        this.toast = toastText;
        this.type = toastType;
        this.position = toastPosition;

        let toast = document.createElement('div');
        toast.classList.add('toast');
        toast.classList.add(this.type);
        toast.classList.add(this.position);
        toast.id = this.toastID;
        
        toast.innerHTML = this.type === 'success' ? '<i class="fas fa-check-circle toast-icon"></i>' : '<i class="fas fa-exclamation-circle toast-icon"></i>';
        toast.innerHTML += '<p class="toast-text">' + this.toast + '</p>';

        document.querySelector('body').appendChild(toast);
    }

    show() {
        let toast = document.getElementById(this.toastID);
        let time = this.time || 3;

        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');

            setTimeout(() => {
                toast.remove();
            }, 500);
        }, time * 1000);
    }
}

class Modal {
    constructor(modalId) {
        this.modal = modalId;
    }

    show() {
        let modal = document.getElementById(this.modal);
        let closeTrough = modal.getAttribute('close-trough') || null;

        modal.classList.add('modal-open');

        if (closeTrough !== null) {
            modal.classList.add('close-trough');

            document.addEventListener('click', (event) => {
                const withinBoundaries = event.composedPath().includes(document.querySelector('.modal-content'));

                if (!withinBoundaries) {
                    modal.classList.remove('modal-open');
                } else {
                    return;
                }
            });
        }
    }

    hide() {
        let modal = document.getElementById(this.modal);
        modal.classList.remove('modal-open');
    }
}

class OffCanvas {
    constructor(offCanvasId) {
        this.offCanvas = offCanvasId;
    }

    show() {
        let offcanvas = document.getElementById(this.offCanvas);
        let closeTrough = offcanvas.getAttribute('close-trough') !== null ? true : false;
        let overlay = offcanvas.getAttribute('overlay') !== null ? true : false;

        if (overlay) {
            document.querySelector('.offcanvas-overlay').classList.add('open');
            if (closeTrough) {
                document.querySelector('.offcanvas-overlay').classList.add('close-trough');
            }
        }

        offcanvas.classList.add('open');
        if (closeTrough) {
            document.addEventListener('click', (event) => {
                const withinBoundaries = event.composedPath().includes(document.querySelector('.offcanvas.open'));

                if (!withinBoundaries) {
                    if (overlay) {
                        document.querySelector('.offcanvas-overlay').classList.remove('open');
                    }
                    
                    offcanvas.classList.remove('open');
                } else {
                    return;
                }
            });
        }
    }

    hide() {
        let offCanvas = document.getElementById(this.offCanvas);
        offCanvas.classList.remove('open');
    }
}

class Spinner {
    constructor(spinnerId, spinnerText) {
        this.spinner = spinnerId;
        this.text = spinnerText;

        if (this.text !== undefined) {
            document.getElementById(spinnerId).querySelector('#' + spinnerId + ' > *:last-child:not(svg)').innerHTML = this.text;
        }
        
    }

    show() {
        let spinner = document.getElementById(this.spinner);
        spinner.style.display = 'flex';
    }

    hide() {
        let spinner = document.getElementById(this.spinner);
        spinner.style.display = 'none';
    }
}

class http {
    constructor(url, method, data, contentType) {
        this.url = url;
        this.method = method || 'GET';
        this.data = data || null;
        this.contentType = contentType || 'application/x-www-form-urlencoded';
    }

    open(url, method, data, contentType) {
        this.url = url;
        this.method = method || 'GET';
        this.data = data || null;
        this.contentType = contentType || 'application/x-www-form-urlencoded';
    }

    async sendRequsest() {
        if (this.method === 'GET') {
            this.data = null;
            this.contentType = null;
        }
        
        if (this.method === 'POST' || this.method === 'PUT' || this.method === 'PATCH') {
            let dataType = typeof this.data;
            if (this.contentType === 'application/json' || this.contentType === 'JSON' || this.contentType === 'json') {
                this.data = JSON.stringify(this.data);
            } else if (dataType === 'object') {
                let formData = new FormData();
                Object.keys(this.data).forEach((key) => {
                    formData.append(key, this.data[key]);
                });
                this.data = formData;
            } else {
                this.contentType = 'application/x-www-form-urlencoded';
            }
        }

        const xhr = new XMLHttpRequest();
        xhr.open(this.method, this.url);
        xhr.setRequestHeader('Content-Type', this.contentType);
        
        if (this.data !== null) {
            xhr.send(this.data);
        } else {
            xhr.send();
        }

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                let response = {
                    status: xhr.status,
                    response: xhr.response
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(response);
                } else {
                    reject(response);
                }
            };
        });
    }

    async send() {
        this.sendRequsest()
    }

    async get(url) {
        this.url = url;
        this.method = 'GET';
        this.data = null;
        this.contentType = null;

        this.sendRequsest();
    }

    async post(url, data, contentType) {
        this.url = url;
        this.method = 'POST';
        this.data = data;
        this.contentType = contentType;
        
        this.sendRequsest();
    }

    async put(url, data, contentType) {
        this.url = url;
        this.method = 'PUT';
        this.data = data;
        this.contentType = contentType;

        this.sendRequsest();
    }

    async patch(url, data, contentType) {
        this.url = url;
        this.method = 'PATCH';
        this.data = data;
        this.contentType = contentType;

        this.sendRequsest();
    }

    async delete(url) {
        this.url = url;
        this.method = 'DELETE';
        this.data = null;
        this.contentType = null;

        this.sendRequsest();
    }

    ready(callback) {
        this.sendRequsest().then((response) => {
            callback(response);
        });
    }

    on(event, callback) {
        this.sendRequsest().then((response) => {
            if (event === 'ready' || event === 'success' || event === 'done' || event === 'complete' || event === 'loaded' || event === 'load' || event === 'finish' || event === 'finished' || event === 'end' || event === 'ended') {
                callback(response);
            }
        });
    }
}

class Form {
    constructor(formId) {
        this.form = formId;
    }

    setData(data) {
        let form = document.getElementById(this.form);

        if (data !== undefined) {
            if (typeof data === 'object') {
                Object.keys(data).forEach((key) => {
                    let input = form.querySelector('[name="' + key + '"]');
                    if (input !== null) {
                        input.value = data[key];
                    }
                });
            }
        }
    }

    submit() {
        let form = document.getElementById(this.form);

        form.submit();
        return this.getData();
    }

    reset() {
        let form = document.getElementById(this.form);
        form.reset();
    }

    getData() {
        let form = document.getElementById(this.form);
        let formData = new FormData(form);
        let data = {};

        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        return data;
    }        

    onSubmit(callback) {
        let form = document.getElementById(this.form);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            callback(this.getData());
        });
    }
}

class CreateElement {
    constructor(element, parent) {
        this.element = document.createElement(element);
        if (parent !== undefined) {
            parent.appendChild(this.element);
        }
    }

    class = (className) => {
        let classes = className.split(' ');

        classes.forEach((className) => {
            this.element.classList.add(className);
        });
    }

    addClass = (className) => {
        this.class(className);
    }

    id = (id) => {
        this.element.id = id;
    }
    
    html = (html) => {
        this.element.innerHTML = html;
    }

    text = (text) => {
        this.element.innerText = text;
    }

    attr = (attr, value) => {
        if (typeof attr === 'object') {
            Object.keys(attr).forEach((key) => {
                this.element.setAttribute(key, attr[key]);
            });
        } else {
            this.element.setAttribute(attr, value);
        }
    }

    style = (style, value) => {
        if (typeof style === 'object') {
            Object.keys(style).forEach((key) => {
                this.element.style[key] = style[key];
            });
        } else {
            this.element.style[style] = value;
        }
    }

    appendTo = (parent) => {
        if (typeof parent === 'object') {
            parent.appendChild(this.element);
        } else {
            document.querySelector(parent).appendChild(this.element);
        }
    }

    append = (child) => {
        if (typeof child === 'object') {
            this.element.appendChild(child);
        } else {
            this.element.appendChild(document.querySelector(child));
        }
    }

    on = (event, callback) => {
        if (typeof event === 'object') {
            if (typeof callback === 'object') {
                event.forEach((event, index) => {
                    this.element.addEventListener(event, callback[index]);
                });
            } else {
                event.forEach((event) => {
                    this.element.addEventListener(event, callback);
                });
            }
        } else {
            this.element.addEventListener(event, callback);
        }
    }

    remove = () => {
        this.element.remove();
    }

    get = () => {
        return this.element;
    }

    getHtml = () => {
        return this.element.outerHTML;
    }

    getText = () => {
        return this.element.innerText;
    }

    getAttr = (attr) => {
        return this.element.getAttribute(attr);
    }

    getStyle = (style) => {
        return this.element.style[style];
    }

    getChildren = () => {
        return this.element.children;
    }

    getChildrenCount = () => {
        return this.element.children.length;
    }

    getChildrenByIndex = (index) => {
        return this.element.children[index];
    }

    getChildrenByClass = (className) => {
        return this.element.getElementsByClassName(className);
    }

    getChildrenById = (id) => {
        return this.element.getElementById(id);
    }

    getChildrenByTag = (tag) => {
        return this.element.getElementsByTagName(tag);
    }

    getChildrenByAttr = (attr, value) => {
        return this.element.querySelectorAll('[' + attr + '="' + value + '"]');
    }

    getChildrenByAttrValue = (attr, value) => {
        return this.element.querySelectorAll('[' + attr + '*="' + value + '"]');
    }
}

class Element {
    constructor(element, all = false) {
        if (all) {
            this.element = document.querySelectorAll(element);
            this.all = true;
        } else {        
            if (document.querySelector(element) !== null) {
                this.element = document.querySelector(element);
            } else {
                this.createElement();
            }
        }
    }

    /**
        @param {any} html
    */
    set html(html) {
        if (this.all) {
            this.element.forEach((element) => {
                element.innerHTML = html;
            });
        } else {
            this.element.innerHTML = html;
        }
    }

    /**
        @param {any} text
    */
    set text(text) {
        if (this.all) {
            this.element.forEach((element) => {
                element.innerText = text;
            });
        } else {
            this.element.innerText = text;
        }
    }

    createElement() {
        this.element = document.createElement(this.element);
    }

    appendTo(parent) {
        if (this.all) {
            this.element.forEach((element) => {
                parent.appendChild(element);
            });
        } else {
            parent.appendChild(this.element);
        }
    }

    prependTo(parent) {
        if (this.all) {
            this.element.forEach((element) => {
                parent.prepend(element);
            });
        } else {
            parent.prepend(this.element);
        }
    }

    insertBefore(element) {
        if (this.all) {
            this.element.forEach((element) => {
                element.parentNode.insertBefore(element, element);
            });
        } else {
            element.parentNode.insertBefore(this.element, element);
        }
    }

    insertAfter(element) {
        if (this.all) {
            this.element.forEach((element) => {
                element.parentNode.insertBefore(element, element.nextSibling);
            });
        } else {
            element.parentNode.insertBefore(this.element, element.nextSibling);
        }
    }

    setAttribute(attribute, value) {
        if (this.all) {
            this.element.forEach((element) => {
                element.setAttribute(attribute, value);
            });
        } else {
            this.element.setAttribute(attribute, value);
        }
    }

    setAttributes(attributes) {
        if (this.all) {
            this.element.forEach((element) => {
                Object.keys(attributes).forEach((key) => {
                    element.setAttribute(key, attributes[key]);
                });
            });
        } else {
            Object.keys(attributes).forEach((key) => {
                this.element.setAttribute(key, attributes[key]);
            });
        }
    }

    setStyle(style, value) {
        if (this.all) {
            this.element.forEach((element) => {
                element.style[style] = value;
            });
        } else {
            this.element.style[style] = value;
        }
    }

    setStyles(styles) {
        if (this.all) {
            this.element.forEach((element) => {
                Object.keys(styles).forEach((key) => {
                    element.style[key] = styles[key];
                });
            });
        } else {
            Object.keys(styles).forEach((key) => {
                this.element.style[key] = styles[key];
            });
        }
    }

    /**
        @param {string} className
    */
    set class(className) {
        let classes = className.split(' ');

        if (this.all) {
            this.element.forEach((element) => {
                classes.forEach((classItem) => {
                    element.classList.add(classItem);
                });
            });
        } else {
            classes.forEach((classItem) => {
                this.element.classList.add(classItem);
            });
        }
    }

    /**
        @param {string} className
    */
    set toggleClass(className) {
        let classes = className.split(' ');

        if (this.all) {
            this.element.forEach((element) => {
                classes.forEach((classItem) => {
                    element.classList.toggle(classItem);
                });
            });
        } else {
            classes.forEach((classItem) => {
                this.element.classList.toggle(classItem);
            });
        }
    }

    /**
        @param {string} className
    */
    removeClass(className) {
        let classes = className.split(' ');

        if (this.all) {
            this.element.forEach((element) => {
                classes.forEach((classItem) => {
                    element.classList.remove(classItem);
                });
            });
        } else {
            classes.forEach((classItem) => {
                this.element.classList.remove(classItem);
            });
        }
    }

    remove() {
        this.element.remove();
    }

    on(event, callback) {
        if (this.all) {
            if (typeof event === 'object') {
                event.forEach((eventItem, i) => {
                    this.element.forEach((element) => {
                        if (callback[i] !== undefined) {
                            element.addEventListener(eventItem, callback[i]);
                        } else {
                            element.addEventListener(eventItem, callback);
                        }
                    });
                });
            } else {
                this.element.forEach((element) => {
                    element.addEventListener(event, callback);
                });
            }
        } else {
            if (typeof event === 'object') {
                event.forEach((eventItem, i) => {
                    if (callback[i] !== undefined) {
                        this.element.addEventListener(eventItem, callback[i]);
                    } else {
                        this.element.addEventListener(eventItem, callback);
                    };
                });
            } else {
                this.element.addEventListener(event, callback);
            }
        }
    }

    off(event, callback) {
        if (this.all) {
            if (typeof event === 'object') {
                event.forEach((eventItem, i) => {
                    this.element.forEach((element) => {
                        if (callback[i] !== undefined) {
                            element.removeEventListener(eventItem, callback[i]);
                        } else {
                            element.removeEventListener(eventItem, callback);
                        }
                    });
                });
            } else {
                this.element.forEach((element) => {
                    element.removeEventListener(event, callback);
                });
            }
        } else {
            if (typeof event === 'object') {
                event.forEach((eventItem, i) => {
                    if (callback[i] !== undefined) {
                        this.element.removeEventListener(eventItem, callback[i]);
                    } else {
                        this.element.removeEventListener(eventItem, callback);
                    };
                });
            } else {
                this.element.removeEventListener(event, callback);
            }
        }
    }

    /**
        @param {function} callback
    */
    set click(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('click', callback);
            });
        } else {
            this.element.addEventListener('click', callback);
        }
    }

    /**
        @param {function} callback
    */
    set hover(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('mouseover', callback);
            });
        } else {
            this.element.addEventListener('mouseover', callback);
        }
    }

    /**
        @param {function} callback
    */
    set mouseover(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('mouseover', callback);
            });
        } else {
            this.element.addEventListener('mouseover', callback);
        }
    }
    
    /**
        @param {function} callback
    */
    set unhover(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('mouseout', callback);
            });
        } else {
            this.element.addEventListener('mouseout', callback);
        }
    }

    /**
        @param {function} callback
    */
    set mouseout(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('mouseout', callback);
            });
        } else {
            this.element.addEventListener('mouseout', callback);
        }
    }

    /**
        @param {function} callback
    */
    set focus(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('focus', callback);
            });
        } else {
            this.element.addEventListener('focus', callback);
        }
    }

    /**
        @param {function} callback
    */
    set blur(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('blur', callback);
            });
        } else {
            this.element.addEventListener('blur', callback);
        }
    }

    /**
        @param {function} callback
    */
    set change(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('change', callback);
            });
        } else {
            this.element.addEventListener('change', callback);
        }
    }

    /**
        @param {function} callback
    */
    set keyup(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('keyup', callback);
            });
        } else {
            this.element.addEventListener('keyup', callback);
        }
    }

    /**
        @param {function} callback
    */
    set keydown(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('keydown', callback);
            });
        } else {
            this.element.addEventListener('keydown', callback);
        }
    }

    /**
        @param {function} callback
    */
    set keypress(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('keypress', callback);
            });
        } else {
            this.element.addEventListener('keypress', callback);
        }
    }

    /**
        @param {function} callback
    */
    set scroll(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('scroll', callback);
            });
        } else {
            this.element.addEventListener('scroll', callback);
        }
    }

    /**
        @param {function} callback
    */
    set resize(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('resize', callback);
            });
        } else {
            this.element.addEventListener('resize', callback);
        }
    }

    /**
        @param {function} callback
    */
    set load(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('load', callback);
            });
        } else {
            this.element.addEventListener('load', callback);
        }
    }

    /**
        @param {function} callback
    */
    set unload(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('unload', callback);
            });
        } else {
            this.element.addEventListener('unload', callback);
        }
    }

    /**
        @param {function} callback
    */
    set select(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('select', callback);
            });
        } else {
            this.element.addEventListener('select', callback);
        }
    }

    /**
        @param {function} callback
    */
    set submit(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('submit', callback);
            });
        } else {
            this.element.addEventListener('submit', callback);
        }
    }

    /**
        @param {function} callback
    */
    set ready(callback) {
        if (this.all) {
            this.element.forEach((element) => {
                element.addEventListener('ready', callback);
            });
        } else {
            this.element.addEventListener('ready', callback);
        }
    }
    
    get get() {
        return this.element;
    }

    get attributes() {
        if (this.all) {
            let attributes = [];
            this.element.forEach((element) => {
                attributes.push(element.attributes);
            });
            return attributes;
        }
        return this.element.attributes;
    }

    getAttribute(attribute) {
        if (this.all) {
            let attributes = [];
            this.element.forEach((element) => {
                attributes.push(element.getAttribute(attribute));
            });
            return attributes;
        }
        return this.element.getAttribute(attribute);
    }

    get style() {
        if (this.all) {
            let styles = [];
            this.element.forEach((element) => {
                styles.push(element.style);
            });
            return styles;
        }
        return this.element.style;
    }

    getStyle(style) {
        if (this.all) {
            let styles = [];
            this.element.forEach((element) => {
                styles.push(element.style[style]);
            });
            return styles;
        } else {
            return this.element.style[style];
        }
    }

    get html() {
        if (this.all) {
            let html = [];
            this.element.forEach((element) => {
                html.push(element.innerHTML);
            });
            return html;
        }
        return this.element.innerHTML;
    }

    get text() {
        if (this.all) {
            let text = [];
            this.element.forEach((element) => {
                text.push(element.textContent);
            });
            return text;
        }
        return this.element.textContent;
    }

    get value() {
        if (this.all) {
            let val = [];
            this.element.forEach((element) => {
                val.push(element.value);
            });
            return val;
        }
        return this.element.value;
    }

    getOffset(value) {
        if (this.all) {
            if (value === 'top') {
                let offsetTop = [];
                this.element.forEach((element) => {
                    offsetTop.push(element.getBoundingClientRect().top);
                });
                return offsetTop;
            } else if (value === 'left') {
                let offsetLeft = [];
                this.element.forEach((element) => {
                    offsetLeft.push(element.getBoundingClientRect().left);
                });
                return offsetLeft;
            } else if (value === 'right') {
                let offsetRight = [];
                this.element.forEach((element) => {
                    offsetRight.push(element.getBoundingClientRect().right);
                });
                return offsetRight;
            } else if (value === 'bottom') {
                let offsetBottom = [];
                this.element.forEach((element) => {
                    offsetBottom.push(element.getBoundingClientRect().bottom);
                });
                return offsetBottom;
            } else if (value === 'width') {
                let offsetWidth = [];
                this.element.forEach((element) => {
                    offsetWidth.push(element.getBoundingClientRect().width);
                });
                return offsetWidth;
            } else if (value === 'height') {
                let offsetHeight = [];
                this.element.forEach((element) => {
                    offsetHeight.push(element.getBoundingClientRect().height);
                });
                return offsetHeight;
            } 
            let offset = [];
            this.element.forEach((element) => {
                offset.push(element.getBoundingClientRect());
            });
            return offset;
        }
        if (value === 'top') {
            return this.element.getBoundingClientRect().top;
        } else if (value === 'left') {
            return this.element.getBoundingClientRect().left;
        } else if (value === 'right') {
            return this.element.getBoundingClientRect().right;
        } else if (value === 'bottom') {
            return this.element.getBoundingClientRect().bottom;
        } else if (value === 'width') {
            return this.element.getBoundingClientRect().width;
        } else if (value === 'height') {
            return this.element.getBoundingClientRect().height;
        }

        return this.element.getBoundingClientRect();
    }

    get offsetTop() {
        if (this.all) {
            let offsetTop = [];
            this.element.forEach((element) => {
                offsetTop.push(element.getBoundingClientRect().top);
            });
            return offsetTop;
        }
        return this.element.getBoundingClientRect().top;
    }

    get offsetLeft() {
        if (this.all) {
            let offsetLeft = [];
            this.element.forEach((element) => {
                offsetLeft.push(element.getBoundingClientRect().left);
            });
            return offsetLeft;
        }
        return this.element.getBoundingClientRect().left;
    }

    get offsetRight() {
        if (this.all) {
            let offsetRight = [];
            this.element.forEach((element) => {
                offsetRight.push(element.getBoundingClientRect().right);
            });
            return offsetRight;
        }
        return this.element.getBoundingClientRect().right;
    }

    get offsetBottom() {
        if (this.all) {
            let offsetBottom = [];
            this.element.forEach((element) => {
                offsetBottom.push(element.getBoundingClientRect().bottom);
            });
            return offsetBottom;
        }
        return this.element.getBoundingClientRect().bottom;
    }

    get offsetWidth() {
        if (this.all) {
            let offsetWidth = [];
            this.element.forEach((element) => {
                offsetWidth.push(element.getBoundingClientRect().width);
            });
            return offsetWidth;
        }
        return this.element.getBoundingClientRect().width;
    }

    get offsetHeight() {
        if (this.all) {
            let offsetHeight = [];
            this.element.forEach((element) => {
                offsetHeight.push(element.getBoundingClientRect().height);
            });
            return offsetHeight;
        }
        return this.element.getBoundingClientRect().height;
    }

    get top() {
        if (this.all) {
            let top = [];
            this.element.forEach((element) => {
                top.push(element.getBoundingClientRect().top);
            });
            return top;
        } else {
            return this.element.getBoundingClientRect().top;
        }
    }

    get left() {
        if (this.all) {
            let left = [];
            this.element.forEach((element) => {
                left.push(element.getBoundingClientRect().left);
            });
            return left;
        } else {
            return this.element.getBoundingClientRect().left;
        }
    }

    get right() {
        if (this.all) {
            let right = [];
            this.element.forEach((element) => {
                right.push(element.getBoundingClientRect().right);
            });
            return right;
        } else {
            return this.element.getBoundingClientRect().right;
        }
    }

    get bottom() {
        if (this.all) {
            let bottom = [];
            this.element.forEach((element) => {
                bottom.push(element.getBoundingClientRect().bottom);
            });
            return bottom;
        } else {
            return this.element.getBoundingClientRect().bottom;
        }
    }

    get width() {
        if (this.all) {
            let width = [];
            this.element.forEach((element) => {
                width.push(element.getBoundingClientRect().width);
            });
            return width;
        } else {
            return this.element.getBoundingClientRect().width;
        }
    }

    get height() {
        if (this.all) {
            let height = [];
            this.element.forEach((element) => {
                height.push(element.getBoundingClientRect().height);
            });
            return height;
        } else {
            return this.element.getBoundingClientRect().height;
        }
    }
}

class SetRoot {
    constructor(rootObject) {
        this.variables = Object.keys(rootObject);
        this.values = Object.values(rootObject);
        this.set();
    }

    set() {
        let root = document.documentElement;
        
        for (let i = 0; i < this.variables.length; i++) {
            root.style.setProperty(this.variables[i], this.values[i]);
            console.log(this.variables[i], this.values[i]);
        }
    }
}

class ToolTip {
    constructor(element, text, position = 'top', delay = 0) {
        this.element = document.querySelector(element);
        this.text = text;
        this.position = position;
        this.delay = delay;

        this.create();
        this.listen();
    }

    create() {
        this.element.setAttribute('tooltip', this.text);
        this.element.setAttribute('tooltip-pos', this.position);
    }

    show() {
        let btn = this.element;

        if (document.getElementById('tooltip-content') !== null) {
            document.getElementById('tooltip-content').remove();
        }
        
        let tooltip = document.createElement('div');
        let tooltipText = btn.getAttribute('tooltip');
        let tooltipPosition = btn.getAttribute('tooltip-pos') || 'top';

        tooltip.classList.toggle('tooltip');
        tooltip.innerHTML = tooltipText;
        tooltip.id = 'tooltip-content'
        tooltip.classList.add(tooltipPosition);

        if (tooltipPosition === 'top') {
            tooltip.style.top = btn.getBoundingClientRect().top - tooltip.getBoundingClientRect().height + 'px';
            tooltip.style.left = btn.getBoundingClientRect().left + (btn.offsetWidth / 2) + 'px';
        } else if (tooltipPosition === 'bottom') {
            tooltip.style.top = btn.getBoundingClientRect().top + (btn.offsetHeight) + 'px';
            tooltip.style.left = btn.getBoundingClientRect().left + (btn.offsetWidth / 2) + 'px';
        } else if (tooltipPosition === 'left') {
            tooltip.style.top = btn.getBoundingClientRect().top + (btn.offsetHeight) + 'px';
            tooltip.style.left = btn.getBoundingClientRect().left + 'px';
        } else if (tooltipPosition === 'right') {
            tooltip.style.top = btn.getBoundingClientRect().top + (btn.offsetHeight) + 'px';
            tooltip.style.left = btn.getBoundingClientRect().left + btn.offsetWidth + 'px';
        }

        document.body.appendChild(tooltip);
    }

    listen() {
        let el = this.element;
        
        el.addEventListener('mouseover', (e) => {
            setTimeout(() => {
                this.show();
            }, this.delay);
        });
        
        el.addEventListener('mouseout', (e) => {
            if (document.getElementById('tooltip-content') !== null) {
                document.getElementById('tooltip-content').remove();
            }
        });
    }
}

class Log {
    constructor(text, type = 'log') {
        this.historic = [];
        this.log = console.log;
        this.warn = console.warn;
        this.error = console.error;
        this.info = console.info;
        this.table = console.table;

        if (text !== undefined) {
            if (type === 'log') {
                this.log(text);
            } else if (type === 'warn') {
                this.warn(text);
            } else if (type === 'error') {
                this.error(text);
            } else if (type === 'info') {
                this.info(text);
            }
            this.historic.push({type: type, text: text});
        }
    }

    log(text) {
        this.log(text);
        this.historic.push({type: 'log', text: text});
    }

    warn(text) {
        this.warn(text);
        this.historic.push({type: 'warn', text: text});
    }

    error(text) {
        this.error(text);
        this.historic.push({type: 'error', text: text});
    }

    info(text) {
        this.info(text);
        this.historic.push({type: 'info', text: text});
    }

    table(data) {
        this.table(data);
        this.historic.push({type: 'table', data: data});
    }

    getHistoric() {
        return this.historic;
    }

    clearHistoric() {
        this.historic = [];
    }

    clearConsole() {
        console.clear();
    }

    clearAll() {
        this.clearConsole();
        this.clearHistoric();
    }

    getConsole() {
        return console;
    }
    
    history() {
        return this.historic;
    }
}

class Global {
    constructor() {
        this.variables = globalVariables;
        this.get();
    }

    get(varibale) {
        this.variables = globalVariables;
        if (varibale !== undefined) {
            return this.variables[varibale];
        }
        return this.variables;
    }

    set(variable, value) {
        this.variables = globalVariables;
        this.variables[variable] = value;
        globalVariables = this.variables;
    }
}

class Cookie {
    constructor(text, accept, refuse = undefined) {
        this.element = document.querySelector('.cookie-banner');
        this.text = text;
        this.accept = accept;
        this.refuse = refuse;
        
        if (document.cookie.indexOf('cookie=accepted') !== -1) {
            this.hide();
        } else {
            this.create(text, accept, refuse);
            this.listen();
        }
    }

    check() {
        if (document.cookie.indexOf('cookie=accepted') !== -1) {
            return true;
        } else {
            return false;
        }
    }

    show() {
        if (this.check() === false) {
            this.element.classList.add('show');
        }
    }

    hide() {
        this.element.classList.remove('show');
    }

    listen() {
        let el = this.element;
        let btnAccept = el.querySelector('.cookie-banner-btn .cookie-accept');
        let btnRefuse = el.querySelector('.cookie-banner-btn .cookie-refuse') || null;

        btnAccept.addEventListener('click', (e) => {
            document.cookie = 'cookie=accept; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';

            this.hide();
        });

        if (btnRefuse !== null) {
            btnRefuse.addEventListener('click', (e) => {
                this.clearAll();
                this.hide();
            });
        }
    }

    create() {
        let el = this.element;

        let cookieBanner = document.createElement('div');
        cookieBanner.classList.add('cookie-banner-content');
        cookieBanner.innerHTML = this.text;
        el.appendChild(cookieBanner);

        let cookieBannerBtn = document.createElement('div');
        cookieBannerBtn.classList.add('cookie-banner-btn');

        let cookieAccept = document.createElement('a');
        cookieAccept.classList.add('cookie-accept', 'btn', 'btn-primary');
        cookieAccept.innerHTML = this.accept;
        cookieBannerBtn.appendChild(cookieAccept);

        if (this.refuse !== undefined) {
            let cookieRefuse = document.createElement('a');
            cookieRefuse.classList.add('cookie-refuse', 'btn', 'btn-secondary');
            cookieRefuse.innerHTML = this.refuse;
            cookieBannerBtn.appendChild(cookieRefuse);
        }

        el.appendChild(cookieBannerBtn);

        this.listen();
    }

    onAccept(callback) {
        let el = this.element;
        let btnAccept = el.querySelector('.cookie-banner-btn .cookie-accept');

        btnAccept.addEventListener('click', (e) => {
            this.hide();

            document.cookie = 'cookie=accept; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';

            if (callback !== undefined) {
                callback();
            }
        });
    }

    onRefuse(callback) {
        let el = this.element;
        let btnRefuse = el.querySelector('.cookie-banner-btn .cookie-refuse');

        btnRefuse.addEventListener('click', (e) => {
            this.hide();
            this.clearAll();

            if (callback !== undefined) {
                callback();
            }
        });
    }

    onShow(callback) {
        let el = this.element;

        el.addEventListener('show', (e) => {
            if (callback !== undefined) {
                callback();
            }
        });
    }

    onHide(callback) {
        let el = this.element;

        el.addEventListener('hide', (e) => {
            if (callback !== undefined) {
                callback();
            }
        });
    }

    on(event, callback) {
        if (event === 'show') {
            this.onShow(callback);
        } else if (event === 'hide') {
            this.onHide(callback);
        } else if (event === 'accept') {
            this.onAccept(callback);
        } else if (event === 'refuse') {
            this.onRefuse(callback);
        }
    }

    setCookie(name, value, days) {
        let expires = '';
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    getCookie(name) {
        let nameEQ = name + '=';
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    eraseCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999;';
    }

    clearAll() {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}

class Storage {
    constructor(name, value) {
        this.name = name || null;
        this.value = value || null;
        this.storage = window.localStorage;

        if (this.name !== null && this.value !== null) {
            this.set(this.name, this.value);
        } else if (this.name !== null && this.value === null) {
            this.get(this.name);
        }
    }

    set(name, value) {
        this.storage.setItem(name, value);
    }

    get(name = null) {
        return name === null ? this.storage : this.storage.getItem(name);
    }

    remove(name) {
        this.storage.removeItem(name);
    }

    clear() {
        this.storage.clear();
    }

    init(storageKey, storageValue = true, items, updatedValue, updatedType = 'class') {
        let storage = this.get(storageKey);
        items = typeof items === 'string' ? document.querySelectorAll(items) : items;
        
        if (storage[0] === '[' && storage[storage.length - 1] === ']') {
            storage = JSON.parse(storage);
        }

        if (storage !== null && items !== null) {
            if (typeof storage === 'string') {
                if (storage === storageValue) {
                    if (updatedType === 'class') {
                        items.forEach((item) => {
                            item.classList.add(updatedValue);
                        });
                    } else if (updatedType === 'attribute') {
                        items.forEach((item) => {
                            item.setAttribute(updatedValue, '');
                        });
                    }
                }
            } else if (typeof storage === 'object') {
                storage.forEach((item, index) => {
                    if (item === storageValue) {
                        if (updatedType === 'class') {
                            items[index].classList.add(updatedValue);
                        } else if (updatedType === 'attribute') {
                            items[index].setAttribute(updatedValue, '');
                        }
                    }
                });
            }
        }
    }
}

class Session {
    constructor(name, value) {
        this.name = name || null;
        this.value = value || null;
        this.storage = window.sessionStorage;

        if (this.name !== null && this.value !== null) {
            this.set(this.name, this.value);
        } else if (this.name !== null && this.value === null) {
            this.get(this.name);
        }
    }

    set(name, value) {
        this.storage.setItem(name, value);
    }

    get(name = null) {
        return name === null ? this.storage : this.storage.getItem(name);
    }

    remove(name) {
        this.storage.removeItem(name);
    }

    clear() {
        this.storage.clear();
    }
}

class Pagination {
    constructor(element) {
        this.element = element;
        this.from = 1;
        this.to = parseInt(document.querySelector(element).getAttribute('to'));
        this.show = parseInt(document.querySelector(element).getAttribute('show')) || 5;
        this.active = 1;
        this.eventListener = null;

        let showCount = this.show - 2;
        let showItemsList = [this.from, this.to];

        for (let i = 0; i <= showCount; i++) {
            showItemsList.push(this.from + i);
        }

        showItemsList.sort((a, b) => a - b);

        this.create(showItemsList, this.from);
    }

    create(showItemsList, activeItem) {
        let el = document.querySelector(this.element);
        let from = this.from;
        let to = this.to;
        let active = activeItem;
        let lastItem;

        el.innerHTML = '';

        for (let i = from; i <= to; i++) {
            if (showItemsList.includes(i) || i === from || i === to) {
                let li = document.createElement('a');
                li.classList.add('pagination-item');
                li.setAttribute('data-page', i);
                li.innerHTML = i;

                if (i === active) {
                    li.classList.add('active');
                }

                el.appendChild(li);
                lastItem = 'item';
            }
        }

        this.listen();
    }

    listen() {
        let el = document.querySelector(this.element);
        let items = el.querySelectorAll('.pagination-item');

        for (let i = 0; i < items.length; i++) {
            items[i].addEventListener('click', (e) => {
                e.preventDefault();
                let page = parseInt(e.target.getAttribute('data-page'));
                this.change(page);
            });
        }
    }

    change(page) {
        let el = document.querySelector(this.element);
        let items = el.querySelectorAll('.pagination-item');
        let from = this.from;
        let to = this.to;
        let showCount = this.show - 3;
        let active = page;
        let prevActive = el.querySelector('.active')
        let showItemsList = []
        
        prevActive.classList.remove('active');

        showItemsList.push(from)

        for (let i = 0; i < items.length; i++) {
            if (parseInt(items[i].getAttribute('data-page')) === active) {
                items[i].classList.add('active');
                
                if (active > showCount && active <= (to-1) - (showCount/2)) {
                    for (let i = 1; i <= (showCount)/2; i++) {
                        showItemsList.push(active - i, active + i);
                    }
                } else if (!(active >= (to-1) - (showCount/2))) {
                    let beforeTemp = active - (showCount/2) - 1;
                    let afterCount = (showCount/2) + (beforeTemp * -1) + 1;
                    let beforeCount = showCount - afterCount;
                    
                    for (let i = 1; i <= beforeCount; i++) {
                        showItemsList.push(active - i);
                    }

                    for (let i = 1; i <= afterCount; i++) {
                        showItemsList.push(active + i);
                    }
                } else if (active >= (to-1) - (showCount/2)) {
                    let afterTemp = active + (showCount/2) - to;
                    let beforeCount = (showCount/2) + (afterTemp) + 1;
                    let afterCount = showCount - beforeCount;

                    for (let i = 1; i <= beforeCount; i++) {
                        showItemsList.push(active - i);
                    }

                    for (let i = 1; i <= afterCount; i++) {
                        showItemsList.push(active + i);
                    }
                }

                showItemsList.push(active)
                break;
            }
        }

        showItemsList = [...new Set(showItemsList)];
        showItemsList.sort((a, b) => a - b);
        this.create(showItemsList, active);

        if (this.eventListener === 'change') {
            this.eventListenerCallback(active);
        } else if (this.eventListener === 'next' && this.active < active) {
            this.eventListenerCallback(active);
        } else if (this.eventListener === 'prev' && this.active > active) {
            this.eventListenerCallback(active);
        }

        this.active = active;
    }

    next() {
        let el = document.querySelector(this.element);
        let active = el.querySelector('.active');
        let next = parseInt(active.getAttribute('data-page')) + 1;

        if (next <= this.to) {
            this.change(next);
        }
    }

    prev() {
        let el = document.querySelector(this.element);
        let active = el.querySelector('.active');
        let prev = parseInt(active.getAttribute('data-page')) - 1;

        if (prev >= this.from) {
            this.change(prev);
        }
    }

    on(event, callback) {
        let el = document.querySelector(this.element);
        let activeItem = el.querySelector('.active');
        
        this.eventListener = event;
        this.eventListenerCallback = callback;
        this.active = parseInt(activeItem.getAttribute('data-page'));

    }
}

class Capture {
    constructor(target = 'body') {
        this.target = document.querySelector(target);
    }

    getValues(item) {
        let tagName = item.tagName.toUpperCase();
        let objectTag = this.results[tagName] = this.results[tagName] || Object.create(null);
        let id = item.getAttribute('id') || null;
        let classes = item.getAttribute('class') || null;
        
        if (id) {
            objectTag['#' + id] = {
                item: item,
                id: id,
                classes: classes || null,
                text: item.text || null,
                html: item.innerHTML || null,
                attributes: item.attributes || null,
                style: item.style || null,
                computedStyle: window.getComputedStyle(item) || null,
                offset: item.getBoundingClientRect() || null,
                children: item.children || null,
                parent: item.parentElement || null,
                siblings: item.parentElement.children || null,
            }
        } else {
            let nodecount = Object.keys(objectTag).length + 1 || 1;
            objectTag[tagName + nodecount] = {
                item: item,
                id: id || null,
                classes: classes || null,
                text: item.text || null,
                html: item.innerHTML || null,
                attributes: item.attributes || null,
                style: item.style || null,
                computedStyle: window.getComputedStyle(item) || null,
                offset: item.getBoundingClientRect() || null,
                children: item.children || null,
                parent: item.parentElement || null,
                siblings: item.parentElement.children || null,
            }
        }

        let target = objectTag[id] || objectTag[tagName];
        let events = ['click', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress', 'focus', 'blur', 'change', 'submit', 'reset', 'select', 'load', 'unload', 'beforeunload', 'resize', 'scroll', 'error', 'abort', 'contextmenu', 'input', 'invalid', 'search', 'selectstart', 'wheel', 'copy', 'cut', 'paste', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop', 'animationstart', 'animationend', 'animationiteration', 'transitionend', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture', 'pointerlockchange', 'pointerlockerror', 'online', 'of']
        
        for (let i = 0; i < events.length; i++) {
            if (item['on' + events[i]]) {
                target['on' + events[i]] = item['on' + events[i]];
            }
        }
    }

    capture(element = null) {
        this.target = element ? document.querySelector(element) : this.target;
        this.results = Object.create(null);
        this.getValues(this.target);

        let items = this.target.querySelectorAll('*');

        for (let i = 0; i < items.length; i++) {
            this.getValues(items[i]);
        }

        return this.results;
    }

    captureTime(time, element = null) {
        this.target = element ? document.querySelector(element) : this.target;

        let self = this;
        let startResult = this.capture();
        return new Promise(function(resolve, reject) {

            setTimeout(async function() {
                let endResult = self.capture();
                let diff = await self.compare(startResult, endResult);
                resolve(diff);
            }, time);
        });
    }

    compare(start, end) {
        let self = this;
        this.results = Object.create(null);

        return new Promise(function(resolve, reject) {
            let addedItems = Object.create(null);
            let removedItems = Object.create(null);
            let changedItems = Object.create(null);
            let startKeys = Object.keys(start);
            let endKeys = Object.keys(end);
            let startItems = [];
            let startNames = [];
            let endItems = [];
            let startFlat = [];
            let endFlat = [];
            
            for (let i = 0; i < startKeys.length; i++) {
                let startItem = startKeys[i];
                
                if (startItem !== 'url' && startItem !== 'title') {
                    for (let j = 0; j < Object.keys(start[startItem]).length; j++) {
                        let startItemKey = Object.keys(start[startItem])[j];
                        startItems.push(start[startItem][startItemKey]['item']);
                        startNames.push(startItemKey);
                        startFlat.push(start[startItem][startItemKey]);
                    }
                }
            }
            
            for (let i = 0; i < endKeys.length; i++) {
                let endItem = endKeys[i];

                if (endItem !== 'url' && endItem !== 'title') {
                    for (let j = 0; j < Object.keys(end[endItem]).length; j++) {
                        let endItemKey = Object.keys(end[endItem])[j];
                        endItems.push(end[endItem][endItemKey]['item']);
                        endFlat.push(end[endItem][endItemKey]);
                    }
                }
            }

            for (let i = 0; i < endItems.length; i++) {
                if (!startItems.includes(endItems[i])) {
                    self.target = endItems[i];

                    let node = endItems[i].nodeName.toUpperCase();
                    let diffItem = self.capture();
                    diffItem = diffItem[Object.keys(diffItem)[0]];

                    if (node in addedItems) {
                        let itemcount = Object.keys(addedItems[node]).length + 1;
                        addedItems[node][node + itemcount] = diffItem[node + '1'];
                    } else {
                        addedItems[node] = diffItem;
                    }
                } else {
                    let node = endItems[i].nodeName.toUpperCase();
                    let startItem = startFlat[startItems.indexOf(endItems[i])];
                    let endItem = endFlat[endItems.indexOf(endItems[i])];
                    let startValues = Object.values(startItem);
                    let endValues = Object.values(endItem);
                    let startKeys = Object.keys(startItem);
                    let endKeys = Object.keys(endItem);

                    for (let j = 0; j < startValues.length; j++) {
                        if (!(['item', 'children', 'parent', 'siblings', 'html', 'style', 'computedStyle', 'offset'].includes(endKeys[j]))) {
                            if (startValues[j] !== endValues[j] && startKeys[j] === endKeys[j]) {
                                if (node in changedItems) {
                                    changedItems[node][endKeys[j]] = {item: endItem.item, changed: endKeys[j], start: startValues[j], end: endValues[j]};
                                } else {
                                    changedItems[node] = Object.create(null);
                                    changedItems[node][endKeys[j]] = {item: endItem.item, changed: endKeys[j], start: startValues[j], end: endValues[j]};
                                }
                            } else if (startKeys.includes(endKeys[j]) && startValues[startKeys.indexOf(endKeys[j])] !== endValues[j]) {
                                if (node in changedItems) {
                                    changedItems[node][endKeys[j]] = {item: endItem.item, changed: endKeys[j], start: startValues[j], end: endValues[j]};
                                } else {
                                    changedItems[node] = Object.create(null);
                                    changedItems[node][endKeys[j]] = {item: endItem.item, changed: endKeys[j], start: startValues[j], end: endValues[j]};
                                }
                            }
                        }
                    }
                }
            }
            
            for (let i = 0; i < startItems.length; i++) {
                if (!endItems.includes(startItems[i])) {
                    let node = startItems[i].nodeName.toUpperCase();

                    if (node in removedItems) {
                        let itemcount = Object.keys(removedItems[node]).length + 1;
                        removedItems[node][node + itemcount] = start[node][startNames[i]];
                    } else {
                        let object = removedItems[node] = Object.create(null);
                        object[node] = start[node][startNames[i]];
                    }
                }
            }

            resolve({'REMOVED': removedItems, 'ADDED': addedItems, 'CHANGED': changedItems});
        });
    }

    startRecord(element = null) {
        this.target = element ? document.querySelector(element) : this.target;
        this.start = this.capture()

        return this.start;
    }

    endRecord(element = null) {
        this.target = element ? document.querySelector(element) : this.target;
        this.end = this.capture()

        return this.end;
    }
}

class Components {
    constructor(component, name, variables = null) {
        this.components = [{
            name: name,
            component: component,
            variables: variables
        }]
    }

    set(component, name, variables = null) {
        this.components.push({name: name, component: component, variables: variables});
    }

    remove(name) {
        this.components.forEach((component, index) => {
            if (component.name === name) {
                this.components.splice(index, 1);
            }
        });
    }

    get() {
        return this.components;
    }

    getComponent(name) {
        this.components.forEach(component => {
            if (component.name === name) {
                return component;
            }
        });
    }

    getComponentVariables(name) {
        this.components.forEach(component => {
            if (component.name === name) {
                return component.variables;
            }
        });
    }

    add(name, parent = 'body', variables = null) {
        let componentEL = '';
        let variableCount = 0;
        let parentEl = document.querySelector(parent);

        this.components.forEach(component => {
            if (component.name === name) {
                componentEL = component.component;
                componentEL.replace(/{{ .*? }}/g, (match, variable) => {
                    if (variables) {
                        componentEL = componentEL.replace(match, variables[Object.keys(variables)[variableCount]]);
                        variableCount++;
                    } else if (component.variables) {
                        componentEL = componentEL.replace(match, component.variables[Object.keys(component.variables)[variableCount]]);
                        variableCount++;
                    }
                });
            }
        });
        
        if (typeof componentEL === 'string') {
            parentEl.innerHTML += componentEL;
        } else {
            parentEl.appendChild(componentEL);
        }
    }

    global(variables) {
        this.components.forEach(component => {
            if (component.variables) {
                Object.keys(component.variables).forEach(variable => {
                    component.variables[variable] = variables[variable];
                });
            }
        });
    }
}

class Router {
    constructor(routes, options = null) {
        this.routes = routes;
        this.options = options;
    }

    set(routes, options = null) {
        this.routes = routes;
        this.options = options;
    }

    get() {
        return this.routes;
    }

    getOptions() {
        return this.options;
    }

    add(route, component, options = null) {
        this.routes.push({route: route, component: component, options: options});
    }

    remove(routeName) {
        this.routes.forEach((route, index) => {
            if (route.route === routeName) {
                this.routes.splice(index, 1);
            }
        });
    }

    navigate(route) {
        let routeFound = false;
        let routeOptions = null;
        let routeComponent = null;
        let routeVariables = null;

        this.routes.forEach((routeItem, index) => {
            if (routeItem.route === route) {
                routeFound = true;
                routeOptions = routeItem.options;
                routeComponent = routeItem.component;
                routeVariables = routeItem.variables;
            }
        });

        if (routeFound) {
            if (routeOptions) {
                if (routeOptions.title) {
                    document.title = routeOptions.title;
                }

                if (routeOptions.variables) {
                    Object.keys(routeOptions.variables).forEach(variable => {
                        routeVariables[variable] = routeOptions.variables[variable];
                    });
                }
            }

            if (routeVariables) {
                Object.keys(routeVariables).forEach(variable => {
                    routeComponent = routeComponent.replace(new RegExp('{{ ' + variable + ' }}', 'g'), routeVariables[variable]);
                });
            }

            document.querySelector('body').innerHTML = routeComponent;
        } else {
            console.error('Route not found');
        }
    }
}

class API {
    constructor() {
        this.api = Object.create(null);
    }

    setRoute(name, url, method = 'GET', headers = null, body = null) {
        this.api[name] = {
            url: url,
            method: method,
            headers: headers,
            body: body
        };
    }

    get() {
        return this.api;
    }

    getRoute(name) {
        return this.api[name];
    }

    getRouteNames() {
        return Object.keys(this.api);
    }

    call(name, body = null, variables = null) {
        let route = this.api[name];
        let url = route.url;
        let method = route.method;
        let headers = route.headers;
        let reqBody = body ? body : route.body;

        if (variables) {
            Object.keys(variables).forEach(variable => {
                url = url.replace(new RegExp(':' + variable, 'g'), variables[variable]);
            });
        }

        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url, true);

            if (headers) {
                Object.keys(headers).forEach(header => {
                    xhr.setRequestHeader(header, headers[header]);
                });
            }

            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };

            xhr.onerror = function() {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };

            xhr.send(reqBody);
        });
    }
}

class Cache {
    constructor() {
        caches.open('default');
    }
    
    set(url) {
        fetch(url).then(response => {
            return caches.open('default').then(cache => {
                cache.put(url, response);
            });
        });
    }

    async get(url) {
        return caches.match(url).then(response => {
            if (response) {
                return response;
            }

            throw new Error('No data');
        });
    }

    getKeys() {
        let url = [];

        return new Promise((resolve, reject) => {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.open(name).then(cache => {
                        cache.keys().then(keys => {
                            keys.forEach(key => {
                                url.push(key.url);
                            });
                            resolve(url);
                        });
                    });
                });
            });
        });
    }

    remove(name) {
        caches.open('default').then(cache => {
            cache.delete(name);
        });
    }

    clear() {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
}

// Functions

function get(url) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function post(url, data, headers = null) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        if (headers) {
            Object.keys(headers).forEach(header => {
                xhr.setRequestHeader(header, headers[header]);
            });
        }

        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function() {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(data);
    });
}

function toggleClass(selector, className) {
    let el = document.querySelector(selector);
    if (el.classList.contains(className)) {
        el.classList.remove(className);
    } else {
        el.classList.add(className);
    }
}

function toggleClassAll(selector, className) {
    let el = document.querySelectorAll(selector);
    for (let i = 0; i < el.length; i++) {
        if (el[i].classList.contains(className)) {
            el[i].classList.remove(className);
        } else {
            el[i].classList.add(className);
        }
    }
}

function hasClass(el, className) {
    if (el.classList.contains(className)) {
        return true;
    } else {
        return false;
    }
}

function hasClassAll(selector, className) {
    let el = document.querySelectorAll(selector);
    for (let i = 0; i < el.length; i++) {
        if (el[i].classList.contains(className)) {
            return true;
        }
    }

    return false;
}

function addClass(selector, className) {
    let el = document.querySelector(selector);
    el.classList.add(className);
}

function addClassAll(selector, className) {
    let el = document.querySelectorAll(selector);
    for (let i = 0; i < el.length; i++) {
        el[i].classList.add(className);
    }
}

function removeClass(selector, className) {
    let el = document.querySelector(selector);
    el.classList.remove(className);
}

function removeClassAll(selector, className) {
    let el = document.querySelectorAll(selector);
    for (let i = 0; i < el.length; i++) {
        el[i].classList.remove(className);
    }
}

function MasonryHeight(element, waitForImg, columnCount, gap, breakpoinst = {}) {
    function createGrid(element, columnCount, gap, breakpoinst) {
        let windowWidth = window.innerWidth;
        let breakpoinstWidth = Object.keys(breakpoinst);
        let breakpoinstColumnCount = Object.values(breakpoinst);
        let grid = document.querySelector(element);
        let girdWidth = grid.offsetWidth;
        let columnWidth = girdWidth / columnCount;
        let columnWidthPercent = (100 / columnCount) + '%';
        let items = document.querySelectorAll(element + ' > *');
        let columnHeight = [];
        
        grid.style.position = 'relative';
        grid.style.width = '100%';

        if (breakpoinstWidth.length > 0) {
            let breakpointWidth;
            for (let i = 0; i < breakpoinstWidth.length; i++) {
                if (windowWidth <= breakpoinstWidth[i]) {
                    breakpointWidth = breakpoinstWidth[i];
                }
            }
            if (breakpointWidth !== undefined) {
                columnCount = breakpoinstColumnCount[breakpoinstWidth.indexOf(breakpointWidth)];
                columnWidth = girdWidth / columnCount;
                columnWidthPercent = (100 / columnCount) + '%';
            }
        }
        
        for (let i = 0; i < items.length; i++) {
            let currentColumn = i % columnCount;
            items[i].style.position = 'absolute';

            if (currentColumn !== 0) {
                items[i].style.left = (columnWidth * (columnHeight.length % columnCount)) + (gap / 2 )+ 'px';
            } else {
                items[i].style.left = '0px';
            }

            if (currentColumn === 0 || currentColumn === columnCount - 1) {
                items[i].style.width = 'calc(' + columnWidthPercent + ' - ' + (gap / 2) + 'px)';
            } else {
                items[i].style.width = 'calc(' + columnWidthPercent + ' - ' + gap + 'px)';
            }

            if (columnHeight.length < columnCount) {
                items[i].style.top = '0px';
            } else {
                let columnTotalHeight = 0;

                for (let j = columnHeight.length - columnCount; j >= 0; j -= columnCount) {
                    columnTotalHeight += columnHeight[j];
                }
                
                items[i].style.top = columnTotalHeight  + 'px';
            }
            
            columnHeight.push(items[i].offsetHeight + gap);
        }

        let columnsTotalHeight = [];

        for (let i = 0; i < columnCount; i++) {
            let columnTotalHeight = 0;

            for (let j = i; j < columnHeight.length; j += columnCount) {
                columnTotalHeight += columnHeight[j];
            }

            columnsTotalHeight.push(columnTotalHeight);
        }

        grid.style.height = Math.max(...columnsTotalHeight) - gap + 'px';
    }

    if (waitForImg) {
        window.addEventListener('load', () => {
            createGrid(element, columnCount, gap, breakpoinst);
        });
    } else {
        createGrid(element, columnCount, gap, breakpoinst);
    }

    window.addEventListener('resize', () => {
        createGrid(element, columnCount, gap, breakpoinst);
    });
}

function MasonryOneColumn(element, columnCount, rowHeight, gap) {
    function createGrid(element, columnCount, rowHeight, gap) {
        let grid = document.querySelector(element);
        let girdWidth = grid.offsetWidth;
        let columnWidth = girdWidth / columnCount;
        let columnWidthPercent = (100 / columnCount) + '%';
        let items = document.querySelectorAll(element + ' > *');
        let columnHeight = [];
        
        grid.style.position = 'relative';
        grid.style.width = '100%';
        grid.style.height = 'auto';
        
        for (let i = 0; i < items.length; i++) {
            let currentColumn = i % columnCount;
            
            for (let attr of items[i].attributes) {
                if ((attr.name.indexOf('x') !== -1 && attr.name.indexOf('x') !== 0) || (attr.name.indexOf('X') !== -1 && attr.name.indexOf('X') !== 0)) {
                    let itemHeight = attr.name.indexOf('x') !== -1 ? attr.name.split('x')[1] : attr.name.split('X')[1];

                    if (itemHeight === 'auto') {
                        itemHeight = 1;
                    }

                    items[i].style.position = 'absolute';
        
                    if (currentColumn !== 0) {
                        items[i].style.left = (columnWidth * (columnHeight.length % columnCount)) + (gap / 2 )+ 'px';
                    } else {
                        items[i].style.left = '0px';
                    }
        
                    if (currentColumn === 0 || currentColumn === columnCount - 1) {
                        items[i].style.width = 'calc(' + columnWidthPercent + ' - ' + (gap / 2) + 'px)';
                    } else {
                        items[i].style.width = 'calc(' + columnWidthPercent + ' - ' + gap + 'px)';
                    }
        
                    if (columnHeight.length < columnCount) {
                        items[i].style.top = '0px';
                    } else {
                        let columnTotalHeight = 0;
        
                        for (let j = columnHeight.length - columnCount; j >= 0; j -= columnCount) {
                            columnTotalHeight += columnHeight[j];
                        }
                        
                        items[i].style.top = columnTotalHeight  + 'px';
                    }
                    columnHeight.push((rowHeight * itemHeight) + gap);
    
                    break;
                }
            }
        }

        let columnsTotalHeight = [];

        for (let i = 0; i < columnCount; i++) {
            let columnTotalHeight = 0;

            for (let j = i; j < columnHeight.length; j += columnCount) {
                columnTotalHeight += columnHeight[j];
            }

            columnsTotalHeight.push(columnTotalHeight);
        }

        grid.style.height = Math.max(...columnsTotalHeight) - gap + 'px';
    }

    createGrid(element, columnCount, rowHeight, gap);
}

function Masonry(element, columnBasis = 100, rowHeight = 100, columnCount = 3, waitForImg = false, gap = 16) {
    function createGrid(element, columnBasis, rowHeight, columnCount, gap) {
        columnCount = columnCount + 1;
        const grid = document.querySelector(element);
        const columnWidth = Math.ceil(grid.offsetWidth / columnCount) < columnBasis ? columnBasis : Math.ceil(grid.offsetWidth / columnCount);
        const gridWidth = grid.offsetWidth;
        const items = document.querySelectorAll(element + ' > *');

        if (gridWidth > (columnWidth * 2)) {
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(' + (columnWidth) + 'px, 1fr))';
            grid.style.gridGap = gap + 'px';
            grid.style.width = '100%';
            grid.style.gridAutoRows = rowHeight + 'px';
            grid.style.gridAutoFlow = 'dense';

            for (let i = 0; i < items.length; i++) {
                items[i].setAttribute('style', '');
                for (let attr of items[i].attributes) {
                    if ((attr.name.indexOf('x') !== -1 && attr.name.indexOf('x') !== 0) || (attr.name.indexOf('X') !== -1 && attr.name.indexOf('X') !== 0)) {
                        let itemWidth = attr.name.indexOf('x') !== -1 ? attr.name.split('x')[0] : attr.name.split('X')[0];
                        let itemHeight = attr.name.indexOf('x') !== -1 ? attr.name.split('x')[1] : attr.name.split('X')[1];

                        if (itemWidth === 'auto') {
                            itemWidth = 1;
                        }

                        if (itemHeight === 'auto') {
                            itemHeight = 1;
                        }

                        if (itemWidth !== '1') {
                            items[i].style.gridColumn = 'span ' + itemWidth;
                        } else {
                            items[i].style.gridColumn = 'auto';
                        }

                        if (itemHeight !== '1') {
                            items[i].style.gridRow = 'span ' + itemHeight;
                        } else {
                            items[i].style.gridRow = 'auto';
                        }

                        break;
                    }
                }
            }
        } else {
            MasonryOneColumn(element, 1, rowHeight, gap)

            for (let i = 0; i < items.length; i++) {
                for (let attr of items[i].attributes) {
                    if (attr.name !== 'style') {
                        let itemHeight = attr.name.indexOf('x') !== -1 ? attr.name.split('x')[1] : attr.name.split('X')[1];

                        if (itemHeight === 'auto') {
                            itemHeight = 1;
                        }
                        
                        items[i].style.height = rowHeight * itemHeight + 'px';
    
                        break;
                    }
                }
            }
        }
    }

    if (waitForImg) {
        window.addEventListener('load', () => {
            createGrid(element, columnBasis, rowHeight, columnCount, gap);
        });
    }

    window.addEventListener('resize', () => {
        createGrid(element, columnBasis, rowHeight, columnCount, gap);
    });
}

function ScrollTo(element, duration, offset) {
    let elementPosition = document.querySelector(element).getBoundingClientRect().top;
    let startPosition = window.pageYOffset;
    let distance = elementPosition - startPosition - offset;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) {
            startTime = currentTime;
        }
        let timeElapsed = currentTime - startTime;
        let run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b;
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

function ScrollToTop(duration, offset) {
    let startPosition = window.pageYOffset;
    let distance = startPosition - offset;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) {
            startTime = currentTime;
        }
        let timeElapsed = currentTime - startTime;
        let run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b;
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

function Wait(ms, callback) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (callback) {
                callback();
            }

            resolve();
        }, ms);
    });
}

function WaitUntil(condition, callback) {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            if (condition() === true) {
                clearInterval(interval);

                if (callback) {
                    callback();
                }

                resolve();
            }
        }, 100);
    });
}

async function WaitUntilElement(element, callback) {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            if (document.querySelector(element) !== null) {
                clearInterval(interval);
                
                if (callback) {
                    callback();
                }

                resolve(document.querySelector(element));
            }
        }, 100);
    }).then((response) => {
        return response;
    });
}

async function WaitUntilVisible(target, callback) {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            let element = document.querySelector(target);
            if (element.style.display !== 'none' && element.style.visibility !== 'hidden' && element.style.opacity !== '0' && element.style.height !== '0px' && element.style.width !== '0px') {
                clearInterval(interval);

                if (callback) {
                    callback();
                }

                resolve(true);
            }
        }, 100);
    }).then((response) => {
        return response;
    });
}

async function WaitUntilElementAdded(target, callback) {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            if (document.querySelector(target) !== null) {
                clearInterval(interval);

                if (callback) {
                    callback();
                }

                resolve(true);
            }
        }, 100);
    }).then((response) => {
        return response;
    });
}

// Function For Element Classes

function element(selector, all = false) {
    return new Element(selector, all);
}

function select(selector, all = false) {
    return new Element(selector, all);
}

function selectAll(selector) {
    return new Element(selector, true);
}

function createElement(element, parent) {
    return new CreateElement(element, parent);
}

// Event Listeners

const spaceElements = document.querySelectorAll('.space');

spaceElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let space = elClass.pop('space');

    if (space.length > 0) {
        el.style.marginTop = space + 'rem';
    }
});

const sidebarMobileElements = document.querySelectorAll('.sidebar-mobile');

sidebarMobileElements.forEach((el) => {
    el.addEventListener('click', (e) => {
        let sidebar = document.querySelector('.sidebar');

        sidebar.classList.toggle('open');

        if (e.target.nodeName === 'I') {
            e.target.parentNode.classList.toggle('open');
        } else {
            e.target.classList.toggle('open');
        }
    });
});

const sidebarGroupTitleElements = document.querySelectorAll('.sidebar-group-title');

sidebarGroupTitleElements.forEach((el) => {
    el.addEventListener('click', (e) => {
        e.target.parentNode.parentNode.classList.toggle('open');
    });
});

const paddingInlineElements = document.querySelectorAll('.padding');

paddingInlineElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let padding = elClass.filter((item) => {
        return item.includes('inline-');
    });

    if (padding.length > 0) {
        el.style.paddingInline = padding[0].split('-')[1] + 'rem';
    }
});

const paddingBlockElements = document.querySelectorAll('.padding');

paddingBlockElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let padding = elClass.filter((item) => {
        return item.includes('block-');
    });

    if (padding.length > 0) {
        el.style.paddingBlock = padding[0].split('-')[1] + 'rem';
    }
});

const marginInlineElements = document.querySelectorAll('.margin');

marginInlineElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let margin = elClass.filter((item) => {
        return item.includes('inline-');
    });

    if (margin.length > 0) {
        el.style.marginInline = margin[0].split('-')[1] + 'rem';
    }
});

const marginBlockElements = document.querySelectorAll('.margin');

marginBlockElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let margin = elClass.filter((item) => {
        return item.includes('block-');
    });
    
    if (margin.length > 0) {
        el.style.marginBlock = margin[0].split('-')[1] + 'rem';
    }
});

const gapElements = document.querySelectorAll('.gap');

gapElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let gap = elClass.filter((item) => {
        return item.includes('gap-');
    });

    if (gap.length > 0) {
        el.style.gap = gap[0].split('-')[1] + 'rem';
    }
});

const gapRowElements = document.querySelectorAll('.gap-row');

gapRowElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let gap = elClass.filter((item) => {
        return item.includes('gap-');
    });

    if (gap.length > 0) {
        el.style.rowGap = gap[0].split('-')[1] + 'rem';
    }
});

const gapColumnElements = document.querySelectorAll('.gap-column');

gapColumnElements.forEach((el) => {
    let elClass = Array.from(el.classList);
    let gap = elClass.filter((item) => {
        return item.includes('gap-');
    });

    if (gap.length > 0) {
        el.style.columnGap = gap[0].split('-')[1] + 'rem';
    }
});

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function setSidebarWidth() {
    if (window.innerWidth > 590) {
        const sidebarElements = document.querySelectorAll('.sidebar');
        const sidebarContentElements = document.querySelectorAll('.sidebar-content');

        sidebarElements.forEach((el, i) => {
            let sidebarChildren = Array.from(el.querySelectorAll('*'));
            let childernWidth = sidebarChildren.map((child) => {
                return child.offsetWidth;
            });
            
            let maxWidth = Math.max(...childernWidth);

            el.style.width = maxWidth + 'px';

            sidebarContentElements[i].style.position = 'relative';
            sidebarContentElements[i].style.left = maxWidth + 'px';
        });
    }
}

function setNavWidth() {
    document.querySelectorAll('.nav').forEach((el) => {
        let nav = el;
        let navMobile = nav.querySelector('.nav-mobile');
        let navList = nav.querySelector('.nav-list');
        let navBrand = nav.querySelector('.nav-brand');
        let navListWidth = navList.offsetWidth;
        let navBrandWidth = navBrand.offsetWidth;
        let widthSum = navListWidth + navBrandWidth;
        let windowWidth = window.innerWidth;
        
        if (widthSum / windowWidth > 0.72) {
            nav.classList.add('nav-responsive');
            navMobile.classList.add('nav-responsive');
        } else {
            nav.classList.remove('nav-responsive');
            navMobile.classList.remove('nav-responsive');
        }
    });
}

function loopLabels() {
    document.querySelectorAll('.label').forEach((el) => {
        let target = el.getAttribute('for');
        let targetElement = document.getElementById(target);

        if (targetElement !== null && targetElement.disabled === true) {
            el.classList.add('label-disabled');
        }
    });
}

function loopInputs() {
    document.querySelectorAll('.input:not([type="search"]').forEach((el) => {
        let target = el.getAttribute('id');
        let targetElement = document.querySelector('[for=' + target + ']');

        if (targetElement === null) {
            el.classList.add('input-standalone');
        }
    });
}

function init() {
    setSidebarWidth();
    setNavWidth();
    loopInputs();
    loopLabels();
}

document.querySelectorAll('[focused]').forEach((el) => {
    el.focus();
});

document.querySelectorAll('form[keyfocus]').forEach((el) => {
    let inputs = el.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                let nextInput = input.nextElementSibling;

                if (nextInput !== null) {
                    if (nextInput.type === 'submit') {
                        el.submit();
                    }
                    nextInput.focus();
                }
            }
        });
    });
});

document.querySelectorAll('.video').forEach((el) => {
    let video = el.querySelector('video');
    let controls = el.querySelector('.controls');
    let playButton = el.querySelectorAll('.video-play-btn, .video-play-btn i');
    let playButtonIcon = el.querySelector('.video-play-btn i');
    let input = el.querySelector('.progress-range');
    let progressTime = el.querySelector('.progress-time');
    let maxTime = 0;
    let volume = el.querySelector('.volume-range');
    let volumeIcon = el.querySelector('.controls-volume i');
    
    volume.style.setProperty('--position-volume', '100%');

    video.onloadedmetadata = function() {
        var minutes = parseInt(video.duration / 60, 10);
        var seconds = parseInt(video.duration % 60)

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        progressTime.innerHTML = '00:00 / ' + minutes + ':' + seconds;
        maxTime = minutes + ':' + seconds;
    };

    playButton.forEach((item) => {
        item.addEventListener('click', (btn) => {
            if (video.paused) {
                video.play();
                
                if (btn.target.nodeName === 'I') {
                    btn.target.classList.remove('fa-play');
                    btn.target.classList.add('fa-pause');
                } else {
                    btn.target.querySelector('i').classList.remove('fa-play');
                    btn.target.querySelector('i').classList.add('fa-pause');
                }
            } else {
                video.pause();
                
                if (btn.target.nodeName === 'I') {
                    btn.target.classList.add('fa-play');
                    btn.target.classList.remove('fa-pause');
                } else {
                    btn.target.querySelector('i').classList.add('fa-play');
                    btn.target.querySelector('i').classList.remove('fa-pause');
                }
            }
        });
    });

    controls.addEventListener('click', (e) => {
        if (video.paused) {
            video.play();
            playButtonIcon.classList.remove('fa-play');
            playButtonIcon.classList.add('fa-pause');
        } else {
            video.pause();
            playButtonIcon.classList.remove('fa-pause');
            playButtonIcon.classList.add('fa-play');
        }
    });

    video.addEventListener('timeupdate', (e) => {
        let videoLength = e.target.duration;
        let videoCurrentTime = e.target.currentTime;
        let videoProgress = (videoCurrentTime / videoLength) * 100;
        let videoWidth = el.querySelector('video').offsetWidth;
        let videoWidthPrecent = (10 / videoWidth) * 100;
        let minutes = parseInt(videoCurrentTime / 60, 10);
        let seconds = parseInt(videoCurrentTime % 60)

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        el.querySelector('.video .progress-range').value = videoProgress + videoWidthPrecent;
        el.querySelector('.video .progress-range').style.setProperty('--position', videoProgress + videoWidthPrecent + '%');

        progressTime.innerHTML = minutes + ':' + seconds + ' / ' + maxTime;
    });

    input.addEventListener('input', (e) => {
        let videoLength = video.duration;
        let videoCurrentTime = (e.target.value / 100) * videoLength;
        let videoProgress = (videoCurrentTime / videoLength) * 100;

        video.currentTime = videoCurrentTime;
        e.target.style.setProperty('--position', videoProgress + '%');
    });

    volume.addEventListener('input', (e) => {
        let volumeValue = (100 - e.target.value) / 100;
        video.volume = volumeValue;

        if (volumeValue === 0) {
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else if (volumeValue > 0 && volumeValue < 0.5) {
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-down');
        } else {
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }

        e.target.style.setProperty('--position-volume', 100 - e.target.value + '%');
    });

    volumeIcon.addEventListener('click', (e) => {
        if (video.volume > 0) {
            video.volume = 0;
            volume.value = 100;
            volume.style.setProperty('--position-volume', '0%');
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            video.volume = 1;
            volume.value = 0;
            volume.style.setProperty('--position-volume', '100%');
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    });
});

document.querySelectorAll('.show-password i').forEach((el) => {
    el.addEventListener('click', (e) => {
        let input = e.target.closest('.show-password').querySelector('input');
        
        if (input.type === 'password') {
            input.type = 'text';
            e.target.classList.remove('fa-eye');
            e.target.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            e.target.classList.remove('fa-eye-slash');
            e.target.classList.add('fa-eye');
        }
    });
});

document.querySelectorAll('.carousel').forEach((el) => {
    let carousel = el;
    let carouselInner = carousel.querySelector('.carousel-inner');
    let carouselItems = carousel.querySelectorAll('.carousel-item');
    let carouselControls = carousel.querySelectorAll('.carousel-control i');
    let carouselAspectRatio = carousel.getAttribute('ratio');
    let carouselLoop = carousel.getAttribute('loop') !== null ? true : false;
    let carouselInidicator = carousel.querySelector('.carousel-indicators') !== null ? carousel.querySelector('.carousel-indicators') : false;
    
    carouselInner.style.aspectRatio = carouselAspectRatio.split('x')[0] + '/' + carouselAspectRatio.split('x')[1];

    if (carouselInidicator !== false) {
        carouselItems.forEach((item, i) => {
            let indicator = document.createElement('span');
            indicator.classList.add('carousel-indicator-item');
            if (i === 0) indicator.classList.add('carousel-indicator-item-active');
            indicator.setAttribute('data-index', i);
            carouselInidicator.appendChild(indicator);
        });
    }

    let carouselIndicators = carousel.querySelectorAll('.carousel-indicator-item');
    
    carouselControls.forEach((control) => {
        control.addEventListener('click', (e) => {
            carouselItems = carousel.querySelectorAll('.carousel-item');
            let direction = e.target.classList.contains('fa-chevron-right') ? 'next' : 'prev';
            let activeItem = carousel.querySelector('.carousel-item-active');
            let activeItemIndex = Array.from(carouselItems).indexOf(activeItem);
            
            if (direction === 'next') {
                if (activeItemIndex === carouselItems.length - 1) {
                    if (carouselLoop === true) {
                        carouselInner.scrollLeft = 0;
                        carouselItems[0].classList.add('carousel-item-active');
                        carouselItems[activeItemIndex].classList.remove('carousel-item-active');

                        if (carouselInidicator !== false) {
                            carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                            carouselIndicators[0].classList.add('carousel-indicator-item-active');
                        }
                        return;
                    }
                    return;
                }

                carouselInner.scrollLeft += carouselItems[activeItemIndex].offsetWidth + 20;
                carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                carouselItems[activeItemIndex + 1].classList.add('carousel-item-active');

                if (carouselInidicator !== false) {
                    carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                    carouselIndicators[activeItemIndex + 1].classList.add('carousel-indicator-item-active');
                }
            } else {
                if (activeItemIndex === 0) {
                    if (carouselLoop === true) {
                        carouselInner.scrollLeft = carousel.scrollWidth;
                        carouselItems[carouselItems.length - 1].classList.add('carousel-item-active');
                        carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                        
                        if (carouselInidicator !== false) {
                            carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                            carouselIndicators[carouselItems.length - 1].classList.add('carousel-indicator-item-active');
                        }
                        return;
                    }
                    return;
                }
                carouselInner.scrollLeft -= carousel.offsetWidth + 20;
                carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                carouselItems[activeItemIndex - 1].classList.add('carousel-item-active');

                if (carouselInidicator !== false) {
                    carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                    carouselIndicators[activeItemIndex - 1].classList.add('carousel-indicator-item-active');
                }
            }
        });
    });

    if (carouselInidicator !== false) {
        carouselIndicators.forEach((indicator) => {
            indicator.addEventListener('click', (e) => {
                carouselItems = carousel.querySelectorAll('.carousel-item');
                let index = e.target.getAttribute('data-index');
                let activeItem = carousel.querySelector('.carousel-item-active');
                let activeItemIndex = Array.from(carouselItems).indexOf(activeItem);

                carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                carouselItems[index].classList.add('carousel-item-active');
                carouselInner.scrollLeft = carouselItems[index].offsetLeft;

                carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                carouselIndicators[index].classList.add('carousel-indicator-item-active');
            });
        });
    }

    carouselInner.addEventListener('touchstart', (e) => {
        carouselItems = carousel.querySelectorAll('.carousel-item');
        let touchStart = e.touches[0].clientX;
        let activeItem = carousel.querySelector('.carousel-item-active');
        let activeItemIndex = Array.from(carouselItems).indexOf(activeItem);

        carouselInner.addEventListener('touchmove', (e) => {
            let touchMove = e.touches[0].clientX;
            let touchDistance = touchStart - touchMove;

            if (touchDistance > 0) {
                if (activeItemIndex === carouselItems.length - 1) {
                    if (carouselLoop === true) {
                        carouselInner.scrollLeft = 0;
                        carouselItems[0].classList.add('carousel-item-active');
                        carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                        
                        if (carouselInidicator !== false) {
                            carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                            carouselIndicators[0].classList.add('carousel-indicator-item-active');
                        }
                        return;
                    }
                    return;
                }
                carouselInner.scrollLeft += carouselItems[activeItemIndex].offsetWidth + 20;
                carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                carouselItems[activeItemIndex + 1].classList.add('carousel-item-active');

                if (carouselInidicator !== false) {
                    carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                    carouselIndicators[activeItemIndex + 1].classList.add('carousel-indicator-item-active');
                }
            } else {
                if (activeItemIndex === 0) {
                    if (carouselLoop === true) {
                        carouselInner.scrollLeft = carousel.scrollWidth;
                        carouselItems[carouselItems.length - 1].classList.add('carousel-item-active');
                        carouselItems[activeItemIndex].classList.remove('carousel-item-active');

                        if (carouselInidicator !== false) {
                            carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                            carouselIndicators[carouselItems.length - 1].classList.add('carousel-indicator-item-active');
                        }
                        return;
                    }
                    return;
                }
                carouselInner.scrollLeft -= carousel.offsetWidth + 20;
                carouselItems[activeItemIndex].classList.remove('carousel-item-active');
                carouselItems[activeItemIndex - 1].classList.add('carousel-item-active');

                if (carouselInidicator !== false) {
                    carouselIndicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                    carouselIndicators[activeItemIndex - 1].classList.add('carousel-indicator-item-active');
                }
            }
        });
    });
});

document.querySelectorAll('.carousel').forEach((el) => {
    let autoplay = el.getAttribute('autoplay') !== null ? true : false;

    if (autoplay) {
        let carousel = el;
        let carouselInner = carousel.querySelector('.carousel-inner');
        let carouselItems = carousel.querySelectorAll('.carousel-item');
        let carouselControls = carousel.querySelectorAll('.carousel-control i');
        let carouselAspectRatio = carousel.getAttribute('ratio');
        let carouselLoop = carousel.getAttribute('loop') !== null ? true : false;
        let carouselTime = carousel.getAttribute('time') !== null ? carousel.getAttribute('time') : 3000;
        let carouselInidicators = carousel.querySelectorAll('.carousel-indicator-item') !== null ? carousel.querySelectorAll('.carousel-indicator-item') : false;
        
        carouselInner.style.aspectRatio = carouselAspectRatio.split('x')[0] + '/' + carouselAspectRatio.split('x')[1];
        
        let carouselInterval = setInterval(() => {
            carouselItems = carousel.querySelectorAll('.carousel-item');
            let activeItem = carousel.querySelector('.carousel-item-active');
            let activeItemIndex = Array.from(carouselItems).indexOf(activeItem);

            if (activeItemIndex === carouselItems.length - 2 && !carouselLoop) {
                clearInterval(carouselInterval);
            }

            carouselItems[activeItemIndex].classList.remove('carousel-item-active');
            
            if (activeItemIndex === carouselItems.length - 1) {
                carouselInner.scrollLeft = 0;
                carouselItems[0].classList.add('carousel-item-active');

                if (carouselInidicators !== false) {
                    carouselInidicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                    carouselInidicators[0].classList.add('carousel-indicator-item-active');
                }
                return;
            }

            carouselInner.scrollLeft += carouselItems[activeItemIndex].offsetWidth + 20;
            carouselItems[activeItemIndex + 1].classList.add('carousel-item-active');

            if (carouselInidicators !== false) {
                carouselInidicators[activeItemIndex].classList.remove('carousel-indicator-item-active');
                carouselInidicators[activeItemIndex + 1].classList.add('carousel-indicator-item-active');
            }
        }, carouselTime);
        
        carouselControls.forEach((control) => {
            control.addEventListener('click', (e) => {
                clearInterval(carouselInterval);
            });
        });

        carouselInner.addEventListener('touchstart', (e) => {
            clearInterval(carouselInterval);
        });
    }
});

document.querySelectorAll('.scroll-see-more').forEach((el) => {
    let seeMoreTop = document.createElement('div');
    let seeMoreBottom = document.createElement('div');

    seeMoreTop.classList.add('see-more-top', 'invisible');
    seeMoreBottom.classList.add('see-more-bottom');

    el.before(seeMoreTop);
    el.after(seeMoreBottom);

    el.addEventListener('scroll', (e) => {
        let scrollHeight = e.target.scrollHeight;
        let scrollTop = e.target.scrollTop;
        let clientHeight = e.target.clientHeight;

        if (scrollTop === 0) {
            seeMoreTop.classList.add('invisible');
        } else {
            seeMoreTop.classList.remove('invisible');
        }

        if (scrollTop + clientHeight === scrollHeight) {
            seeMoreBottom.classList.add('invisible');
        } else {
            seeMoreBottom.classList.remove('invisible');
        }
    });
});

document.querySelectorAll('.img-popup').forEach((el) => {
    el.addEventListener('click', (e) => {
        let src = e.target.getAttribute('src');
        let overlay = document.createElement('div');
        let closeOutside = e.target.getAttribute('close-trough');

        overlay.classList.add('img-overlay', 'open');
        overlay.innerHTML = '<img src="' + src + '" alt="" />';

        if (closeOutside !== null) {
            overlay.classList.add('close-trough');
        }

        let close = document.createElement('i');
        close.classList.add('fas', 'fa-times', 'close');

        overlay.appendChild(close);
        document.body.appendChild(overlay);

        close.addEventListener('click', (btn) => {
            document.querySelector('.img-overlay').remove();
        });

        e.stopPropagation();
        if (closeOutside !== null) {
            document.addEventListener('click', (event) => {
                const withinBoundaries = event.composedPath().includes(document.querySelector('.img-overlay img'));

                if (!withinBoundaries) {
                    document.querySelector('.img-overlay').remove();
                } else {
                    return;
                }
            });
        }
    });
});

document.querySelectorAll('.nav-item.dropdown > a').forEach((el) => {
    if (el.parentNode.getAttribute('click') === null) {
        el.addEventListener('mouseover', (e) => {
            let dropdown = e.target.nextElementSibling;
            dropdown.classList.add('open');
            dropdown.style.left = 0;
        });

        el.addEventListener('mouseout', (e) => {
            let dropdown = e.target.nextElementSibling;
            dropdown.classList.remove('open');
        });
    } else {
        el.addEventListener('click', (e) => {
            e.target.nextElementSibling.classList.toggle('open');
        });
    }
});

document.querySelectorAll('.btn-dropdown, .btn-dropdown i, .dropdown-btn, .dropdown-btn i').forEach((el) => {
    let target = null;
    let button = null;
    if (el.nodeName === 'I') {
        target = el.parentNode.nextElementSibling;
        button = el.parentNode;
    } else {
        target = el.nextElementSibling;
        button = el;
    }

    if (target.classList.contains('menu-fit')) {
        target.style.width = button.offsetWidth + 'px';
    }

    if (target.parentNode.getAttribute('click') === null) {
        el.addEventListener('mouseover', (e) => {
                let windowHeight = window.innerHeight;
                let dropdownTop = target.offsetHeight + target.getBoundingClientRect().top;
                let dropdownRight = target.offsetWidth + target.getBoundingClientRect().right;
                let dropdownLeft = target.getBoundingClientRect().left;
                let dropdownWidth = target.offsetWidth;
                let buttonPos = button.getBoundingClientRect();
                
                if (target.parentNode.classList.contains('right')) {
                    if (windowHeight < dropdownTop) {
                        target.style.top = '-' + target.offsetHeight + 'px';
                    } else {
                        target.style.top = '-' + buttonPos.height + 'px';
                    }

                    if (buttonPos.width + dropdownWidth > window.innerWidth) {
                        target.style.left = '-' + (target.offsetWidth - buttonPos.width) + 'px';
                    } else {                    
                        target.style.left = buttonPos.width + 'px';
                    }
                } else {
                    if (windowHeight < dropdownTop) {
                        target.style.top = '-' + target.offsetHeight - (buttonPos.height / 2) + 'px';
                    } else {
                        target.style.top = buttonPos.height + 'px';
                    }
                }

                target.classList.add('open');
        });
    } else {
        el.addEventListener('click', (e) => {
            let windowHeight = window.innerHeight;
            let dropdownTop = target.offsetHeight + target.getBoundingClientRect().top;
            let dropdownRight = target.offsetWidth + target.getBoundingClientRect().right;
            let dropdownLeft = target.getBoundingClientRect().left;
            let dropdownWidth = target.offsetWidth;
            let buttonPos = button.getBoundingClientRect();
            
            if (target.parentNode.classList.contains('right')) {
                if (windowHeight < dropdownTop) {
                    target.style.top = '-' + target.offsetHeight + 'px';
                } else {
                    target.style.top = '-' + buttonPos.height + 'px';
                }

                if (buttonPos.width + dropdownWidth > window.innerWidth) {
                    target.style.left = '-' + (target.offsetWidth - buttonPos.width) + 'px';
                } else {                    
                    target.style.left = buttonPos.width + 'px';
                }
            } else {
                if (windowHeight < dropdownTop) {
                    target.style.top = '-' + target.offsetHeight - (buttonPos.height / 2) + 'px';
                } else {
                    target.style.top = buttonPos.height + 'px';
                }
            }

            target.classList.add('open');
        });
    }

    el.addEventListener('mouseout', (e) => {
        let target = null;
        if (e.target.nodeName === 'I') {
            target = e.target.parentNode.nextElementSibling;
        } else {
            target = e.target.nextElementSibling;
        }

        target.classList.remove('open');
    });
});

document.querySelectorAll('.btn-copy').forEach((el) => {
    el.addEventListener('click', (e) => {
        let target = e.target.getAttribute('data-copy-target');
        let copyText = document.querySelector('[data-copy=' + target + ']').innerText;

        navigator.clipboard.writeText(copyText);

        e.target.innerHTML = '<i class="fa-solid fa-check"></i>'
        setTimeout(() => {
            e.target.innerHTML = '<i class="fa-solid fa-copy"></i>'
        }, 1500);
    });
});

document.querySelectorAll('.input-email-validate').forEach((el) => {
    el.addEventListener('change', (e) => {
        if (!validateEmail(e.target.value)) {
            e.target.classList.add('input-error');
        } else {
            e.target.classList.remove('input-error');
        }
    });
});

document.querySelectorAll('.input[type="range"]:not(.progress-range, .volume-range)').forEach((el) => {
    el.addEventListener('input', (e) => {
        let target = e.target.getAttribute('id');
        let value = e.target.value;
        
        document.querySelector('[for=' + target + ']').innerHTML = value;
    });
});

document.querySelectorAll('.input-search').forEach((el) => {
    el.addEventListener('keyup', (e) => {
        let target = e.target.getAttribute('search-target');
        let searchContent = document.getElementById(target);
        let searchValue = e.target.value.toLowerCase();

        if (searchContent.nodeName === 'TABLE') {
            let rows = searchContent.querySelectorAll('tbody tr');

            rows.forEach((row) => {
                let rowContent = row.innerText.toLowerCase();

                if (rowContent.indexOf(searchValue) > -1) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        } else if (searchContent.nodeName === 'UL') {
            let rows = searchContent.querySelectorAll('li');

            rows.forEach((row) => {
                let rowContent = row.innerText.toLowerCase();

                if (rowContent.indexOf(searchValue) > -1) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        } else {
            let rows = document.querySelectorAll('#' + target + ' > *')
            let results = [];

            rows.forEach((row) => {
                let rowContent = row.innerText.toLowerCase();

                if (rowContent.indexOf(searchValue) > -1) {
                    row.style.display = '';
                    results.push(row);
                } else {
                    row.style.display = 'none';
                }
            });

            if (results.length === 1) {
                results[0].style.marginBlock = '1rem';
            } else {
                rows.forEach((row, i) => {
                    if (i === 0) {
                        row.style.marginTop = '1rem';
                        row.style.marginBottom = '0';
                    } else if (i === rows.length - 1) {
                        row.style.marginBottom = '1rem';
                        row.style.marginTop = '0';
                    } else {
                        row.style.margin = '0';
                    }
                });
            }
        }
    });
});

document.querySelectorAll('.search-container .search-input input').forEach((el) => {
    el.addEventListener('keyup', (e) => {
        let searchValue = e.target.value.toLowerCase();
        let searchContent = e.target.parentNode.parentNode.querySelectorAll('.search-terms > *:not(.search-no-results)')
        let searchNoResults = e.target.parentNode.parentNode.querySelector('.search-no-results');
        let results = [];

        searchContent.forEach((content) => {
            let contentValue = content.innerText.toLowerCase();

            if (contentValue.indexOf(searchValue) > -1) {
                content.style.display = '';
                results.push(content);
            } else {
                content.style.display = 'none';
            }
        });

        if (results.length === 0) {
            searchNoResults.style.display = 'block';
        } else {
            searchNoResults.style.display = 'none';
        }
    });
});

document.querySelectorAll('[offcanvas]').forEach((el) => {
    el.addEventListener('click', (e) => {
        let target = e.target.getAttribute('offcanvas');
        let offcanvas = document.getElementById(target);
        let closeTrough = offcanvas.getAttribute('close-trough') !== null ? true : false;
        let overlay = offcanvas.getAttribute('overlay') !== null ? true : false;

        if (overlay) {
            document.querySelector('.offcanvas-overlay').classList.add('open');
            if (closeTrough) {
                document.querySelector('.offcanvas-overlay').classList.add('close-trough');
            }
        }

        offcanvas.classList.add('open');

        e.stopPropagation();
        if (closeTrough) {
            document.addEventListener('click', (event) => {
                const withinBoundaries = event.composedPath().includes(document.querySelector('.offcanvas.open'));

                if (!withinBoundaries) {
                    if (overlay) {
                        document.querySelector('.offcanvas-overlay').classList.remove('open');
                    }
                    
                    offcanvas.classList.remove('open');
                } else {
                    return;
                }
            });
        }
    });
});

document.querySelectorAll('.offcanvas').forEach((el) => {
    let overlay = el.getAttribute('overlay') !== null ? true : false;
    
    if (overlay) {
        let overlayElement = document.createElement('div');
        overlayElement.classList.add('offcanvas-overlay');

        document.body.appendChild(overlayElement);
    }
});

document.querySelectorAll('.offcanvas-header i').forEach((el) => {
    el.addEventListener('click', (e) => {
        let target = e.target.closest('.offcanvas');
        let overlay = target.getAttribute('overlay') !== null ? true : false;

        if (overlay) {
            document.querySelector('.offcanvas-overlay').classList.remove('open');
        }
        
        target.classList.remove('open');
    });
});

document.querySelectorAll('[data-target-modal]').forEach((el) => {
    el.addEventListener('click', (e) => {
        let target = e.target.getAttribute('data-target-modal');
        let modal = document.getElementById(target);
        let closeTrough = modal.getAttribute('close-trough') || null;

        modal.classList.add('modal-open');

        e.stopPropagation();
        if (closeTrough !== null) {
            modal.classList.add('close-trough');

            document.addEventListener('click', (event) => {
                const withinBoundaries = event.composedPath().includes(document.querySelector('.modal-content'));

                if (!withinBoundaries) {
                    modal.classList.remove('modal-open');
                } else {
                    return;
                }
            });
        }
    });
});

document.querySelectorAll('.modal-close').forEach((el) => {
    el.addEventListener('click', (e) => {
        let modal = e.target.closest('.modal');

        modal.classList.remove('modal-open');
    });
});

document.querySelectorAll('[data-target-banner]').forEach((el) => {
    el.addEventListener('click', (e) => {
        let target = e.target.getAttribute('data-target-banner');
        let banner = document.getElementById(target);
        let time = banner.getAttribute('time') || false;

        banner.classList.add('show');

        if (time !== false) {
            setTimeout(() => {
                banner.classList.remove('show');
            }, time);
        }
    });
});

document.querySelectorAll('.banner-close').forEach((el) => {
    el.addEventListener('click', (e) => {
        let banner = e.target.closest('.banner');

        banner.classList.remove('show');
    });
});

document.querySelectorAll('[data-target-toast]').forEach((el) => {
    el.addEventListener('click', (e) => {
        let target = e.target.getAttribute('data-target-toast');
        let toast = document.getElementById(target);
        let time = Array.from(toast.classList).filter((item) => {
            if (!isNaN(parseFloat(item))) {
                return item;
            }
        })[0] || 3;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, time * 1000);
    });
});

document.querySelectorAll('[tooltip]').forEach((el) => {
    el.addEventListener('mouseover', (e) => {
        if (document.getElementById('tooltip-content') !== null) {
            document.getElementById('tooltip-content').remove();
        }
        
        let tooltip = document.createElement('div');
        let tooltipText = e.target.getAttribute('tooltip');
        let tooltipPosition = e.target.getAttribute('tooltip-pos') || 'top';

        tooltip.classList.toggle('tooltip');
        tooltip.innerHTML = tooltipText;
        tooltip.id = 'tooltip-content'
        tooltip.classList.add(tooltipPosition);

        if (tooltipPosition === 'top') {
            tooltip.style.top = e.target.getBoundingClientRect().top - tooltip.getBoundingClientRect().height + 'px';
            tooltip.style.left = e.target.getBoundingClientRect().left + (e.target.offsetWidth / 2) + 'px';
        } else if (tooltipPosition === 'bottom') {
            tooltip.style.top = e.target.getBoundingClientRect().top + (e.target.offsetHeight) + 'px';
            tooltip.style.left = e.target.getBoundingClientRect().left + (e.target.offsetWidth / 2) + 'px';
        } else if (tooltipPosition === 'left') {
            tooltip.style.top = e.target.getBoundingClientRect().top + (e.target.offsetHeight) + 'px';
            tooltip.style.left = e.target.getBoundingClientRect().left + 'px';
        } else if (tooltipPosition === 'right') {
            tooltip.style.top = e.target.getBoundingClientRect().top + (e.target.offsetHeight) + 'px';
            tooltip.style.left = e.target.getBoundingClientRect().left + e.target.offsetWidth + 'px';
        }

        document.body.appendChild(tooltip);
    });

    el.addEventListener('mouseout', (e) => {
        if (document.getElementById('tooltip-content') !== null) {
            document.getElementById('tooltip-content').remove();
        }
    });
});

document.querySelectorAll('.accordion-item input[type="checkbox"]').forEach((el) => {
    el.addEventListener('change', (e) => {
        if (e.target.checked) {
            e.target.parentNode.classList.add('accordion-item-open');
            e.target.parentNode.querySelector('.accordion-item-body').style.maxHeight = e.target.parentNode.querySelector('.accordion-item-body').scrollHeight + 32 + 'px';

            let accordion = e.target.closest('.accordion');
            let accordionItems = Array.from(accordion.querySelectorAll('.accordion-item'));

            accordionItems.forEach((item) => {
                if (item !== e.target.parentNode) {
                    item.classList.remove('accordion-item-open');
                    
                    let checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = false;
                    item.querySelector('.accordion-item-body').style.maxHeight = null;
                }
            });
        } else {
            e.target.parentNode.classList.remove('accordion-item-open');
            e.target.parentNode.querySelector('.accordion-item-body').style.maxHeight = null;
        }
    });
});

document.querySelectorAll('input:not(.input-autocomplete)').forEach((el) => {
    el.autocomplete = 'off';
});

document.querySelectorAll('.modal-split .modal-side[image]').forEach((el) => {
    let image = el.getAttribute('image');
    let content = document.querySelector('.modal-side:not([image])');
    let contentHeight = content.offsetHeight;

    el.style.backgroundImage = `url(${image})`;
    el.style.height = contentHeight + 2 + 'px';
});

document.querySelectorAll('.dragdrop').forEach((el) => {
    let dragdropID = el.getAttribute('id') || false;
    let items = Array.from(el.querySelectorAll('.dragdrop-item'));

    items.forEach((item, i) => {
        let draggableItem = item.children[0] || false;
        item.id = dragdropID + '-' + i;

        if (draggableItem !== false) {
            draggableItem.setAttribute('draggable', 'true');

            draggableItem.addEventListener('dragstart', (e) => {
                let dragdropID = e.target.closest('.dragdrop-item').getAttribute('id');
                e.dataTransfer.setData("text", dragdropID);
            });
        }

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            var data = e.dataTransfer.getData("text");
            e.target.appendChild(document.getElementById(data).children[0]);
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    });
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        let observerOnce = false;
        if (entry.target.getAttribute('observer-once') === null) {
            observerOnce = true;
        } else {
            observerOnce = (entry.target.getAttribute('observer-once') === 'true');
        }
        
        if (entry.isIntersecting) {
            entry.target.classList.add(entry.target.getAttribute('observer-class'));
        } else if (entry.intersectionRatio < 0.5 && !observerOnce) {
            entry.target.classList.remove(entry.target.getAttribute('observer-class'));
        }
    });
});

document.querySelectorAll('.observer').forEach((el) => {
    observer.observe(el);
});

window.addEventListener('load', (e) => {
    document.querySelectorAll('.modal').forEach((el) => {
        el.style.display = 'block';
    });
});

window.addEventListener('scroll', (e) => {
    if (window.innerWidth > 590) {
        let windowTop = window.pageYOffset;
        let sidebarLinks = document.querySelectorAll('.sidebar-item:not(.sidebar-separator, .sidebar-group-title) .sidebar-link');
        
        sidebarLinks.forEach((el) => {
            let name = el.innerHTML.replace(' ', '');
            name = name.replace('<i class="fa-solid fa-caret-down"></i>', '')
            name = name.replace('<i class="fa-solid fa-caret-up"></i>', '')
            
            if (windowTop >= document.querySelector('#' + name).offsetTop - 150) {
                sidebarLinks.forEach((el) => {
                    el.classList.remove('sidebar-link-active');
                });
                
                el.classList.add('sidebar-link-active');
                el.parentNode.parentNode.parentNode.classList.add('open');
            }
        });

        let openSidebarGroupsActive = document.querySelectorAll('.sidebar-group.open:not(:has(.sidebar-link-active))');
        openSidebarGroupsActive.forEach((el) => {
            el.classList.remove('open');
        });
    }
});

window.addEventListener('resize', (e) => {
    setSidebarWidth();
    setNavWidth();
});

init();