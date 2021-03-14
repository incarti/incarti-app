import { html } from '../Helpers.js';
import {translate as t} from '../Translation.js';
import State from '../State.js';
import Session from '../Session.js';
import ProfilePhotoPicker from '../components/ProfilePhotoPicker.js';
import { route } from '../lib/preact-router.es.js';
import SafeImg from '../components/SafeImg.js';
import CopyButton from '../components/CopyButton.js';
import FollowButton from '../components/FollowButton.js';
import Identicon from '../components/Identicon.js';
import View from './View.js';

class Store extends View {
  constructor() {
    super();
    this.eventListeners = [];
    this.followedUsers = new Set();
    this.followers = new Set();
    this.cart = {};
    this.state = {items:{}};
    this.items = {};
    this.id = 'profile';
  }

  addToCart(k, e) {
    e.stopPropagation();
    const count = (this.cart[k] || 0) + 1;
    State.local.get('cart').get(this.props.store).get(k).put(count);
  }

  shouldRedirect() {
    if (!this.props.store) {
      route('/store/' + Session.getPubKey());
      return true;
    }
  }

  renderView() {
    if (this.shouldRedirect()) {
      return '';
    }
    const cartTotalItems = Object.keys(this.cart).filter(k => !!this.cart[k] && !!this.items[k]).reduce((sum, k) => sum + this.cart[k], 0);
    this.isMyProfile = Session.getPubKey() === this.props.store;
    const chat = Session.channels[this.props.store];
    const uuid = chat && chat.uuid;
    const followable = !(this.isMyProfile || this.props.store.length < 40);
    let profilePhoto;
    if (this.isMyProfile) {
      profilePhoto = html`<${ProfilePhotoPicker} currentPhoto=${this.state.photo} placeholder=${this.props.store} callback=${src => this.onProfilePhotoSet(src)}/>`;
    } else {
      if (this.state.photo) {
        profilePhoto = html`<${SafeImg} class="profile-photo" src=${this.state.photo}/>`
      } else {
        profilePhoto = html`<${Identicon} str=${this.props.store} width=250/>`
      }
    }
    return html`
      <div class="content">
        ${cartTotalItems ? html`
          <p>
            <button class="cartBox" onClick=${() => route('/checkout/' + this.props.store)}> 
            <svg class="svg-icon" viewBox="0 0 20 20">
              <path fill="none" d="M17.671,13.945l0.003,0.002l1.708-7.687l-0.008-0.002c0.008-0.033,0.021-0.065,0.021-0.102c0-0.236-0.191-0.428-0.427-0.428H5.276L4.67,3.472L4.665,3.473c-0.053-0.175-0.21-0.306-0.403-0.306H1.032c-0.236,0-0.427,0.191-0.427,0.427c0,0.236,0.191,0.428,0.427,0.428h2.902l2.667,9.945l0,0c0.037,0.119,0.125,0.217,0.239,0.268c-0.16,0.26-0.257,0.562-0.257,0.891c0,0.943,0.765,1.707,1.708,1.707S10,16.068,10,15.125c0-0.312-0.09-0.602-0.237-0.855h4.744c-0.146,0.254-0.237,0.543-0.237,0.855c0,0.943,0.766,1.707,1.708,1.707c0.944,0,1.709-0.764,1.709-1.707c0-0.328-0.097-0.631-0.257-0.891C17.55,14.182,17.639,14.074,17.671,13.945 M15.934,6.583h2.502l-0.38,1.709h-2.312L15.934,6.583zM5.505,6.583h2.832l0.189,1.709H5.963L5.505,6.583z M6.65,10.854L6.192,9.146h2.429l0.19,1.708H6.65z M6.879,11.707h2.027l0.189,1.709H7.338L6.879,11.707z M8.292,15.979c-0.472,0-0.854-0.383-0.854-0.854c0-0.473,0.382-0.855,0.854-0.855s0.854,0.383,0.854,0.855C9.146,15.596,8.763,15.979,8.292,15.979 M11.708,13.416H9.955l-0.189-1.709h1.943V13.416z M11.708,10.854H9.67L9.48,9.146h2.228V10.854z M11.708,8.292H9.386l-0.19-1.709h2.512V8.292z M14.315,13.416h-1.753v-1.709h1.942L14.315,13.416zM14.6,10.854h-2.037V9.146h2.227L14.6,10.854z M14.884,8.292h-2.321V6.583h2.512L14.884,8.292z M15.978,15.979c-0.471,0-0.854-0.383-0.854-0.854c0-0.473,0.383-0.855,0.854-0.855c0.473,0,0.854,0.383,0.854,0.855C16.832,15.596,16.45,15.979,15.978,15.979 M16.917,13.416h-1.743l0.189-1.709h1.934L16.917,13.416z M15.458,10.854l0.19-1.708h2.218l-0.38,1.708H15.458z"></path>
            </svg>
            
            (${cartTotalItems})</button>
          </p>
        ` : ''}
        <div class="store-items">
          ${this.isMyProfile ? html`
            <div class="store-item" style="min-content" onClick=${() => route(`/product/new`)}>
              <a href="/product/new" class="name">Add a product</a>
            </div>
          ` : ''}
          ${Object.keys(this.state.items).map(k => {
            const i = this.state.items[k];
            return html`
              <div class="store-item" onClick=${() => route(`/product/${k}/${this.props.store}`)}>
                <${SafeImg} src=${i.photo}/>
                <a href="/product/${k}/${this.props.store}" class="name">${i.name}</a>
                <p class="description">${i.description}</p>
                <p class="price">${i.price}</p>
                <div class="null">
                  <button class="add" style="" onClick=${e => this.addToCart(k, e)}>
                    <svg class="svg-icon" viewBox="0 0 20 20">
                      <path fill="none" d="M7.93,4.509H9.62v1.689c0,0.233,0.189,0.422,0.422,0.422s0.422-0.189,0.422-0.422V4.509h1.689c0.233,0,0.423-0.189,0.423-0.422s-0.189-0.422-0.423-0.422h-1.689V1.975c0-0.233-0.189-0.422-0.422-0.422S9.62,1.742,9.62,1.975v1.689H7.93c-0.233,0-0.422,0.189-0.422,0.422S7.697,4.509,7.93,4.509 M18.489,8.311H1.595c-0.466,0-0.845,0.378-0.845,0.845V10c0,0.466,0.378,0.845,0.845,0.845h0.169l1.533,7.282l0.007-0.001c0.046,0.183,0.205,0.321,0.402,0.321h12.67c0.198,0,0.356-0.139,0.403-0.321l0.007,0.001l1.533-7.282h0.169c0.466,0,0.845-0.379,0.845-0.845V9.155C19.334,8.689,18.955,8.311,18.489,8.311 M2.626,10.845H5.53l0.266,1.689H2.982L2.626,10.845z M3.16,13.379h2.769l0.267,1.689H3.515L3.16,13.379z M4.049,17.603l-0.355-1.689h2.636l0.267,1.689H4.049z M9.62,17.603H7.441l-0.267-1.689H9.62V17.603z M9.62,15.068H7.041l-0.267-1.689H9.62V15.068z M9.62,12.534H6.641l-0.266-1.689H9.62V12.534z M12.644,17.603h-2.179v-1.689h2.446L12.644,17.603zM13.043,15.068h-2.579v-1.689h2.845L13.043,15.068z M10.464,12.534v-1.689h3.245l-0.266,1.689H10.464z M16.035,17.603h-2.548l0.268-1.689h2.636L16.035,17.603z M16.569,15.068h-2.682l0.267-1.689h2.77L16.569,15.068z M17.103,12.534h-2.814l0.267-1.689h2.903L17.103,12.534z M18.489,10H1.595V9.155h16.895V10z"></path>
                    </svg>
                    ${this.cart[k] ? ` (${this.cart[k]})` : ''}
                  </button>
                </div>
              </div>
            `
          })}
        </div>
      </div>
    `;
  }

  componentWillUnmount() {
    this.eventListeners.forEach(e => e.off());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.store !== this.props.store) {
      this.componentDidMount();
    }
  }

  updateTotalPrice() {
    const totalPrice = Object.keys(this.cart).reduce((sum, currentKey) => {
      const item = this.items[currentKey];
      const price = item && parseInt(item.price) || 0;
      return sum + price * this.cart[currentKey];
    }, 0);
    this.setState({totalPrice});
  }

  componentDidMount() {
    if (this.shouldRedirect()) {
      return;
    }
    const pub = this.props.store;
    this.eventListeners.forEach(e => e.off());
    this.setState({followedUserCount: 0, followerCount: 0, name: '', photo: '', about: '', totalPrice: 0});
    this.isMyProfile = Session.getPubKey() === pub;
    this.cart = {};

    State.local.get('cart').get(this.props.store).map().on((v, k) => {
      this.cart[k] = v;
      this.setState({cart: this.cart})
      this.updateTotalPrice();
    });

    if (pub) {
      State.public.user(pub).get('store').get('products').map().on((p, id) => {
        if (p) {
          const o = {};
          o[id] = p;
          Object.assign(this.items, o);
          this.updateTotalPrice();
        } else {
          delete this.items[id];
        }
        this.setState({items: this.items});
      });
    }
  }
}

export default Store;
