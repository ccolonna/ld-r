'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'fluxible-router';
import {
    appFullTitle,
    appShortTitle,
    enableAuthentication,
    enableDynamicReactorConfiguration,
    enableDynamicServerConfiguration,
    enableDynamicfacetsConfiguration,
    configDatasetURI
} from '../configs/general';

const PUBLIC_URL = process.env.PUBLIC_URL || '';
console.log('Does webpack inject this ?');
console.log(PUBLIC_URL);

class Nav extends React.Component {
    componentDidMount() {
        let currentComp = this.refs.defaultNavbar;
        $(currentComp)
            .find('.ui.dropdown')
            .dropdown();
    }
    showHelpModal() {
        /*global $*/
        $('.ui.modal').modal('show');
    }
    render() {
        let user = this.context.getUser();
        // console.log(user);
        let userMenu;
        let configMenu = (
            <a
                href={'/browse/' + encodeURIComponent(configDatasetURI)}
                className="ui item link"
                title="Configuration Manager"
            >
                <i className="ui black settings icon inverted"></i>
            </a>
        );
        if (enableAuthentication) {
            if (user) {
                userMenu = (
                    <div className="ui right dropdown item">
                        {user.accountName} <i className="dropdown icon"></i>
                        <div className="menu">
                            <NavLink
                                className="item"
                                routeName="resource"
                                href={
                                    '/dataset/' +
                                    encodeURIComponent(user.datasetURI) +
                                    '/resource/' +
                                    encodeURIComponent(user.id)
                                }
                            >
                                Profile
                            </NavLink>
                            {parseInt(user.isSuperUser) ? (
                                <NavLink
                                    className="item"
                                    routeName="users"
                                    href="/users"
                                >
                                    Users List
                                </NavLink>
                            ) : (
                                ''
                            )}
                            <a href="/logout" className="item">
                                Logout
                            </a>
                        </div>
                    </div>
                );
            } else {
                userMenu = (
                    <div className="ui right item">
                        {' '}
                        <a
                            className="ui mini circular teal button"
                            href="/login"
                        >
                            Sign-in
                        </a>{' '}
                        &nbsp;{' '}
                        <a
                            href="/register"
                            className="ui mini circular yellow button"
                        >
                            Register
                        </a>{' '}
                    </div>
                );
                configMenu = '';
            }
        }
        let navbarColor = 'blue';
        if (this.props.loading) {
            navbarColor = 'grey';
        }
        return (
            <div>
                <div
                    id="nav-open"
                    className="hidden-nav-open"
                    onMouseOver={() => {
                        document
                            .getElementById('navbar')
                            .classList.remove('hidden-navbar');
                        document
                            .getElementById('nav-open')
                            .classList.add('hidden-nav-open');
                    }}
                >
                    <img
                        style={{
                            height: 30,
                            margin: 'auto',
                            display: 'block',
                            position: 'absolute',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            marginTop: 10,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            zIndex: 2
                        }}
                        src="https://cdn2.iconfinder.com/data/icons/arrows-3-1/512/xxx039-512.png"
                    ></img>
                </div>

                <div
                    id="navbar"
                    className="ui fluid container"
                    ref="defaultNavbar"
                >
                    <nav
                        className={'ui menu inverted grid' + navbarColor}
                        style={{
                            backgroundColor: 'rgba(0,0,0,.87)'
                        }}
                    >
                        <NavLink
                            routeName="home"
                            className="brand item"
                            href="/"
                        >
                            {this.props.loading ? (
                                <img
                                    src={`${PUBLIC_URL}/assets/img/loader.gif`}
                                    alt="loading..."
                                    style={{ height: 30, width: 30 }}
                                />
                            ) : (
                                <img
                                    style={{ height: 22, width: 22 }}
                                    className="ui mini image"
                                    src={`${PUBLIC_URL}/assets/img/ld-reactor.gif`}
                                    alt="ld-reactor"
                                />
                            )}
                        </NavLink>
                        <a className="item" href={`${PUBLIC_URL}/about`}>
                            About {appShortTitle}{' '}
                        </a>
                        <a className="item" href={`${PUBLIC_URL}/datasets`}>
                            Datasets
                        </a>
                        <div className="right menu">
                            <div
                                className="item link"
                                onClick={this.showHelpModal}
                            >
                                <i className="small help circle icon"></i>
                            </div>
                            {enableDynamicReactorConfiguration ||
                            enableDynamicServerConfiguration ||
                            enableDynamicfacetsConfiguration
                                ? configMenu
                                : ''}
                            <a
                                href="https://github.com/Christian-Nja/odp-reactor"
                                className="ui item link"
                            >
                                <i className="github circle icon"></i> Github
                            </a>
                            {userMenu}
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}
Nav.contextTypes = {
    getUser: PropTypes.func
};
export default Nav;
