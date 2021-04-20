/**
 * This is the top-level component that defines your UI application.
 *
 * This is an appropriate spot for application wide components and configuration,
 * stuff like application chrome (headers, footers, navigation, etc), routing
 * (what urls go where), etc.
 *
 * @see https://github.com/reactjs/react-router-tutorial/tree/master/lessons
 */

import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';
import { Header, Content, Footer, Layout } from '@allenai/varnish/components';
import { Menu } from 'antd';
import { Link } from '@allenai/varnish-react-router';
import { logos } from '@allenai/varnish/components';

import Home from './pages/Home';
import About from './pages/About';
import Screening from './pages/Screening'
import AnnotationGuidelines from './pages/Guidelines'
import Tool from './pages/Tool'
import { AppRoute } from './AppRoute';

/**
 * An array capturing the available routes in your application. You can
 * add or remove routes here.
 */
const ROUTES: AppRoute[] = [
    {
        path: '/',
        label: 'Home',
        component: Home,
    },
    {
        path: '/screening',
        label: 'Annotators Onboarding',
        component: Screening
    },
    {
        path: '/guidelines',
        label: 'Annotation Guidelines',
        component: AnnotationGuidelines,
    },
    {
        path: '/tool',
        label: 'Tool Interface',
        component: Tool,
    }
];

export default class App extends React.PureComponent<RouteComponentProps> {
    render() {
        return (
            <BrowserRouter>
                <Route path="/">
                <Layout bgcolor="white">
                        <Header>
                            <Header.Columns columns="auto 1fr auto">
                                <Header.Logo label={<Header.AppName>SciCo</Header.AppName>}>
                                <logos.SemanticScholar />
                                </Header.Logo>
                                <span />
                                <Header.MenuColumn>
                                    <Menu
                                        defaultSelectedKeys={[this.props.location.pathname]}
                                        mode="horizontal">
                                        {ROUTES.map(({ path, label }) => (
                                            <Menu.Item key={path}>
                                                <Link to={path}>{label}</Link>
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                </Header.MenuColumn>
                            </Header.Columns>
                        </Header>
                        <Content main>
                            {ROUTES.map(({ path, component }) => (
                                <Route key={path} path={path} exact component={component} />
                            ))}
                        </Content>
                        <Footer />
                    </Layout>
                </Route>
            </BrowserRouter>
        );
    }
}

const SimpleLogo = styled.div`
    border-radius: 25px;
    width: 50px;
    height: 50px;
    line-height: 1;
    font-size: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: ${({ theme }) => theme.color.B2};
`;
