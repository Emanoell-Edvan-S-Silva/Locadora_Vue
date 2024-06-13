import Vue from 'vue';
import Router from 'vue-router';

import Dashboard from '../views/DashBoardView.vue';
import UserView from '../views/UserView.vue';
import BookView from '../views/BookView.vue';
import PublisherView from '../views/PublisherView.vue';
import RentalsView from '../views/RentalView.vue';

Vue.use(Router)

export default new Router({
    mode:'history',
    routes: [
        {
            path: '/',
            component: Dashboard
        },
        {
            path: '/Users',
            component: UserView
        },
        {
            path: '/Books',
            component: BookView
        },
        {
            path: '/Publishers',
            component: PublisherView
        },
        {
            path: '/Rentals',
            component: RentalsView
        },
        
    ],
})
