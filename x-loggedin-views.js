import { html } from '@polymer/lit-element';

export const revView = (that) => html`
            <ul>
                <li>REVERSE</li>
                <li>E-post: ${that.user.email}</li>
                <li>ID: ${that.user.uid}</li>
            </ul>`


export const defView = (that) => html`
    <ul>
        <li>DEFAULT</li>
        <li>ID: ${that.user.uid}</li>
        <li>E-post: ${that.user.email}</li>
    </ul>`