export const usermixin = (element) => {
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
}

export const theuser = firebase.auth();