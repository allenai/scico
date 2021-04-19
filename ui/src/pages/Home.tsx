import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from 'react-router';
import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Input from 'antd/es/input';
import LoadingOutlined from '@ant-design/icons/lib/icons/LoadingOutlined';
import { List, Typography, Divider } from 'antd';

import { solve, Answer, Query } from '../api';
import {
    Content
} from '@allenai/varnish/components';
import * as antd from 'antd';
import {Select, Space, Card} from 'antd';
const { Title, Paragraph, Text } = antd.Typography;
const { TextArea } = Input;

import { Row, Col } from 'antd';

const team = [
    'Arie Cattan',
    'Sophie Johnson',
    'Daniel Weld',
    'Ido Dagan',
    'Iz Beltagy',
    'Doug Downey',
    'Tom Hope'
  ];

/**
 * We use a state machine to capture the current state of the view. Since
 * there's a form it might be empty, loading, displaying an answer or
 * giving the user feedback about an error.
 *
 * Feel free to preserve this constructor, or roll your own solution. Do
 * what works best for your use case!
 */
enum View {
    EMPTY,
    LOADING,
    ANSWER,
    ERROR,
}

/**
 * The home page has a form, which requires the preservation of state in
 * memory. The links below contain more information about component state
 * and managed forms in React:
 *
 * @see https://reactjs.org/docs/state-and-lifecycle.html
 * @see https://reactjs.org/docs/forms.html
 *
 * Only use state when necessary, as in-memory representaions add a bit of
 * complexity to your UI.
 */
interface State {
    query: Query;
    view: View;
    answer?: Answer;
    error?: string;
}

export default class Home extends React.PureComponent<RouteComponentProps, State> {
    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            query: Query.fromQueryString(props.location),
            view: View.EMPTY,
        };
    }

    /**
     * Returns whether there is an answer and whether that answer is for
     * the current query.
     *
     * @returns {boolean}
     */
    hasAnswerForCurrentQuery() {
        return this.state.answer && this.state.answer.query.equals(this.state.query);
    }

    /**
     * Submits an API query for an answer for the current query.
     *
     * @returns {void}
     */
    fetchAnswer() {
        // We store a local variable capturing the value of the current
        // query. We use this as a semaphore / lock of sorts, since the
        // API query is asynchronous.
        const originalQuery = this.state.query;
        this.setState({ view: View.LOADING }, () => {
            solve(this.state.query)
                .then((answer) => {
                    // When the API returns successfully we make sure that
                    // the returned answer is for the last submitted query.
                    // This way we avoid displaying an answer that's not
                    // associated with the last query the user submitted.
                    if (this.state.query.equals(originalQuery)) {
                        this.setState({
                            view: View.ANSWER,
                            error: undefined,
                            answer,
                        });
                    }
                })
                .catch((err) => {
                    // Again, make sure that the error is associated with the
                    // last submitted query.
                    if (this.state.query.equals(originalQuery)) {
                        // Try to see if there's a more specific error
                        // we're supposed to display.
                        let error;
                        if (err.response) {
                            // If the check below is true, the API returned
                            // error message that's likely helpful to display
                            if (err.response.data && err.response.data.error) {
                                error = err.response.data.error;
                            } else if (err.response.status === 503) {
                                error =
                                    'Our system is a little overloaded, ' +
                                    'please try again in a moment';
                            }
                        }

                        // Fallback to a general error message
                        if (!error) {
                            error = 'Something went wrong. Please try again.';
                        }
                        this.setState({
                            view: View.ERROR,
                            answer: undefined,
                            error,
                        });
                    }
                });
        });
    }

    /**
     * This handler updates the query whenever the user changes the question
     * text. It's bound to the question input's `onChange` handler in the
     * `render` method below.
     *
     * @see https://reactjs.org/docs/forms.html
     */
    handleQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        this.setState((state) => ({
            query: new Query(value, state.query.choices),
        }));
    };

    /**
     * This handler updates the query whenever the user changes the first
     * answer text. It's bound to the answer input's `onChange` handler in the
     * `render` method below.
     *
     * @see https://reactjs.org/docs/forms.html
     */
    handleFirstAnswerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        this.setState((state) => ({
            query: new Query(state.query.question, [value, state.query.choices[1]]),
        }));
    };

    /**
     * This handler updates the query whenever the user changes the second
     * answer text. It's bound to the answer input's `onChange` handler in the
     * `render` method below.
     *
     * @see https://reactjs.org/docs/forms.html
     */
    handleSecondAnswerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        this.setState((state) => ({
            query: new Query(state.query.question, [state.query.choices[0], value]),
        }));
    };

    /**
     * This handler is invoked when the form is submitted, which occurs when
     * the user clicks the submit button or when the user clicks input while
     * the button and/or a form element is selected.
     *
     * We use this instead of a onClick button on a button as it matches the
     * traditional form experience that end users expect.
     *
     * @see https://reactjs.org/docs/forms.html
     */
    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        // By default, HTML forms make a request back to the server. We
        // prevent that and instead submit the request asynchronously.
        event.preventDefault();

        // We add the query params to the URL, so that users can link to
        // our demo and share noteworthy cases, edge cases, etc.
        this.props.history.push(`/?${this.state.query.toQueryString()}`);

        // Query the answer and display the result.
        this.fetchAnswer();
    };

    /**
     * This is a lifecycle function that's called by React after the component
     * has first been rendered.
     *
     * We use it here to fetch an answer if the url parameters include a fully
     * defined query.
     *
     * You can read more about React component's lifecycle here:
     * @see https://reactjs.org/docs/state-and-lifecycle.html
     */
    componentDidMount() {
        if (this.state.query.isValid() && !this.hasAnswerForCurrentQuery()) {
            this.fetchAnswer();
        }
    }

    /**
     * The render method defines what's rendered. When writing yours keep in
     * mind that you should try to make it a "pure" function of the component's
     * props and state.  In other words, the rendered output should be expressed
     * as a function of the component properties and state.
     *
     * React executes render whenever a component's properties and/or state is
     * updated. The output is then compared with what's rendered and the
     * required updates are made. This is to ensure that rerenders make as few
     * changes to the document as possible -- which can be an expensive process
     * and lead to slow interfaces.
     */

    


    render() {
        return (
            <React.Fragment>
               <Content main className="center"  >
                   <Title level={4}>Abstract</Title>
                    
                   <Paragraph>
                   Determining coreference of concept mentions across multiple documents is fundamental for natural language understanding. 
                   Work on cross-document coreference resolution (CDCR) typically considers mentions of events in the news, 
                   which do not often involve abstract technical concepts that are prevalent in science and technology. 
                   These complex concepts take diverse or ambiguous forms and have many hierarchical levels of granularity (e.g., tasks and subtasks), posing challenges for CDCR. 
                   We present a new task of <em>hiearchical</em> CDCR for concepts in scientific papers, with the goal of <em>jointly</em> inferring coreference clusters and hierarchy between them. 
                   We create <b>SciCo</b>, an expert-annotated dataset for this task, which is 3X larger than the prominent ECB+ resource. 
                   We find that tackling both coreference and hierarchy at once outperforms disjoint models, which we hope will spur development of joint models for <b>SciCo</b>.                       
                   </Paragraph>

                   <Paragraph>
                       More details can be found in the paper: <br></br>
                       <b>SCICO: Hierarchical Cross-Document Coreference for Scientific Concepts (2021)</b> <br></br>
                       <em>Arie Cattan, Sophie Johnson, Daniel Weld, Ido Dagan, Iz Beltagy, Doug Downey and Tom Hope</em>
                   </Paragraph>

                   <img src="/images/scico_teaser.png" className="center" width="50%" height="50%" />
                   
                   <Title level={4}>Data and Annotation</Title>
                    <Paragraph>
                    Click <a>here</a> to download the data.
                    </Paragraph>

                    
                    <Paragraph>

                        We screen the annotators using the task of <em>faceted-search</em> as a motivation. Our tutorial
                        and guided annotation are shown in <a href='/screening'>Screening</a> and full annotation guidelines
                        are shown in <a href='/guidelines'>Annotation Guidelines</a>. 
                        We extended <a href='https://www.aclweb.org/anthology/2020.emnlp-demos.27/' target="_blank">CoRefi (Bornstein et al., 2020)</a> with the ability to annotate hierarchy of clusters, as shown in <a href='/tool'>Tool Interface</a>.

                        <br></br>
                        


                    </Paragraph>

                   <Title level={4}>Code</Title>
                    <Paragraph>
                        Code of the models: <a href='https://github.com/ariecattan/SciCo'>https://github.com/ariecattan/SciCo </a>
                    </Paragraph>
                    <Paragraph>
                        Code for the extended CoRefi: <a href='https://github.com/ariecattan/CoRefi'>https://github.com/ariecattan/CoRefi</a>
                    </Paragraph>

                   <Title level={4}>Citation</Title>
                   <Title level={4}>Team</Title>
                   <Paragraph>
                   <ul>
                        <li>Arie Cattan</li>
                        <li>Sophie Johnson</li>
                        <li>Daniel Weld</li>
                        <li>Ido Dagan</li>
                        <li>Iz Beltagy</li>
                        <li>Doug Downey</li>
                        <li>Tom Hope</li>
                    </ul>
                   </Paragraph>
                    
                    
               </Content>
            </React.Fragment>
        );
    }
}

/**
 * The definitions below create components that we can use in the render
 * function above that have extended / customized CSS attached to them.
 * Learn more about styled components:
 * @see https://www.styled-components.com/
 *
 *
 * CSS is used to modify the display of HTML elements. If you're not familiar
 * with it here's quick introduction:
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS
 */

const Form = styled.form`
    margin: ${({ theme }) => `0 0 ${theme.spacing.sm}`};
    max-width: 600px;
`;

const SubmitButton = styled(Button).attrs({
    htmlType: 'submit',
})`
    margin: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 0`};
`;

const SubmitContainer = styled.div`
    display: grid;
    grid-template-columns: min-content min-content;
    grid-gap: ${({ theme }) => `${theme.spacing.xs} 0 0`};
    align-items: center;
`;

const InputLabel = styled.div`
    margin-top: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.xxs};
`;
