import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps } from 'react-router';
import { Alert, Button, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Link } from '@allenai/varnish-react-router';
import { List, Typography, Divider } from 'antd';

import {
    Content
} from '@allenai/varnish/components';
import * as antd from 'antd';
import {Select, Space, Card} from 'antd';

const { Title, Paragraph, Text } = antd.Typography;
import { solve, Answer, Query } from '../api';
const { TextArea } = Input;

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
                <p>Welcome to our annotation task! Our goal is to build models that can identify when specific mentions of methods / tasks 
                in computer science papers refer to the same underlying method/task concept, 
                and also build a hierarchy of these concepts. To motivate and explain our task in detail, 
                let’s start with a concrete example. Please read it carefully, followed by the annotation task instructions.
            </p>

            <Title level={3}>Motivation and Examples</Title>

            <p>We want to enable <em>faceted search</em> of scientific papers based
                on <em>methods</em> and <em>tasks</em> in Semantic Scholar, and allow users to browse concept hierarchies to refine their search:</p>

           <img src="/images/s2-faceted-search.png" className="center" width="85%" height="85%" />
            
           <br></br>
           <br></br>
            <p>Here, the user selects two tasks: <b>Speech Recognition</b> and <b>Sequence Tagging</b>, and one method: <strong> RNN</strong></p>

                <p>Sequence Tagging is the<strong> parent category</strong> of Part of Speech (POS) Tagging 
                    and Named-Entity Recognition (NER), and RNN is the <strong>parent category</strong> of LSTM.&nbsp;
                The output is a list of papers using RNN (or LSTM) for one of the tasks. 
                There are many in which papers refer to the concept of sequence tagging or to RNN. We want to find all of these <Text mark>co-referring</Text> mentions, excluding those with only <Text><Wrong>surface similarity</Wrong></Text>.
                {/* (<span className="mention">underlined and highlighted in bold</span> in the examples below).  */}
                </p>

        

                   

                    
                    <ul>
                    <li>
                        <span className="paper-title">An End-to-end Model for English Transcription</span><br></br>
                        <span className="paper-content">This paper proposes an end-to-end model 
                        for transcription using the recent transformers-based language models&hellip; 
                        Following previous work, the <Text mark>ASR component</Text>&nbsp;
                        of our system is based on an&nbsp; 
                        <Text mark>RNN</Text>&nbsp;...
                        </span>
                        </li>
                    </ul>

                    <br></br>
                    <ul>
                    <li><span className="paper-title">Revisiting features-based approaches for Information Extraction</span>
                        <br/><span className="paper-content">As we can see in Table 4 
                            and 5, the <Text mark>LSTM</Text> outperforms neural baselines 
                                    (Luco et al., 2018; Smith et al, 2019) by a large margin on&nbsp;
                                    <Text mark>NER</Text>, <Text mark>PTB POS Tagging</Text>,
                                   and dependency parsing.&nbsp;</span>
                                </li>
                    </ul>
                    <br></br>
                    <ul>
                    <li><span className="paper-title">Massively parallel expressed sequence tag clustering</span>
                        <br/><span className="paper-content">This study presents the first expressed <Text><Wrong>sequence tag</Wrong></Text> (EST) collection for Senecio 
                        madagascariensis, a globally invasive plant species.</span>
                                </li>
                    </ul>

                    <br></br>
                    <ul>
                    <li><span className="paper-title">A new corpus for NLP pipelines</span><br />
                        <span className="paper-content">We created a new dataset with multiple levels 
                            of annotation, including <Text mark>part-of-speech</Text>,
                                 <Text mark>named entities</Text>, semantic-role. 
                                    We build a multi-task optimization model based on 
                                    an <Text mark>LSTM framework </Text>
                                    in order to set baseline results for all our tasks.</span></li>
                    </ul>
                    <br></br>
                    <ul>
                    <li><span className="paper-title">A unified approach for Text-to-speech and Speech-to-Text </span><br />
                       <span className="paper-content"> <Text mark>Recognizing and translating</Text> spoken language into text is a fundamental task.. Our model is built upon 
                            the <Text mark>recurrent neural network</Text>.
                           <br /></span></li>
                    </ul>
                    <br></br>
                    {/* <ul>
                    <li><span className="paper-title">Improving the Efficiency of Sequential Processing<br /></span>
                        <span className="paper-content">The bottleneck of <span className="mention">recurrent&nbsp; neural networks
                        </span> often prevents them from being deployed in realistic use-cases. 
                            In this paper, we investigate how to scale them for <span className="mention">large-vocabulary 
                                speech recognition</span></span></li>
                    </ul> */}
                    
                    <Space direction="horizontal" >
                        <Card style={{ width: 270 }}>
                        <Text mark>Recognizing and translating</Text>, 
                            <Text mark>ASR Component</Text>
                        </Card>
                        <Card style={{ width: 150 }}>
                            
                        <Text mark>NER</Text>, <Text mark>named entities</Text>                                 
                        
                        </Card>
                        <Card style={{width: 200}}>
                        <Text mark>PTB POS Tagging</Text>, <Text mark>part-of-speech</Text>
                        </Card>
                        <Card style={{ width: 180 }}>
                           
                            <Text mark>RNN</Text>,  <Text mark>recurrent neural network</Text>
                           
                        </Card>
                        <Card>
                        <Text mark>LSTM</Text>,  <Text mark>LSTM framework </Text>
                        </Card>

                        </Space>
                        
                    <br></br>
                    <br></br>
                    
                    
                    <Paragraph>
                    To effectively achieve this goal, we need to: <br></br>
                    <ol>
                        <li>Identify when entities across multiple papers <strong>express the same concept</strong> (e.g., ASR and speech recognition, or self-driving cars and autonomous vehicles)</li>
                        <li>Identify that a concept is <strong><em>a subtype/subtask</em></strong> of another,
                        (e.g., <em>abstractive summarization</em> is a subtask of <em>text summarization</em>,
                        <em>LSTM</em> is a subtype of <em>RNN</em>, 
                        <em>image classification</em> is a subtask of <em>computer vision</em>).</li>
                        </ol>
                    </Paragraph>
                    
                        
                        <Title level={3}>Annotation Task Definition</Title>
                        {/* <h4>Annotation Task Definition</h4> */}

<p>
    You will be given multiple chunks of text from CS papers, with highlighted spans referring to methods and tasks.</p>
    <b>Your goals: </b>
    <ol>
        <li><strong>Group</strong> mentions that refer to the same concept.<br></br></li>
        <li>Build a <strong>hierarchy</strong> between the groups - when one concept is a <em>subtype/subtask</em> of another.</li>
    </ol>
    <br></br>
    
    <b>Keep in mind the aforementioned use case of faceted-search to assist your annotation decisions.</b>


        <br></br>
        <p><b>Please carefully follow the following steps:</b></p>

            <p><b>1. Tutorial</b> </p>


            <p>Please first do <a href="https://nlp.biu.ac.il/~ariecattan/sci-coref-hypernym/annotation.html?id=tutorial" target="_blank">this</a> tutorial 
            to get familiar with the tool functionalities. (Full details about the tool interface are also explained in the <a href='/tool'>Tool Interface</a>). 
            Here’s a demonstration showing how to add notes to concepts and build the <b>hierarchy</b> of concepts using drag-and-drop operations: </p>
            
                <img src="/images/hypernym_new.gif" width="85%" height="85%"></img>

            <br></br>
            

            <b>2. Carefully read the <a href='/guidelines'>Annotation Guidelines</a>.</b>
            
            <br></br>
            <br></br>
            <p>
                <b>3. Guided Annotation </b>
            </p>

            <Paragraph>
                Please do the following "guided" annotations in which you'll be provided with short annotation texts 
                and we’ll guide you to the right <span className="message">linking decision</span> along the way. You'll get the feedback on the <span className="message">hierarchy</span> at the end.
            <br></br>
            <br></br>
            
            <ul>
                <li>  <a href="https://nlp.biu.ac.il/~ariecattan/sci-coref-hypernym/annotation.html?id=guided_sentiment" target="_blank">
                    Sentiment Analysis</a> </li>
                <li><a href="https://nlp.biu.ac.il/~ariecattan/sci-coref-hypernym/annotation.html?id=guided_attention" target="_blank">
                    Attention</a></li> 
            </ul>
            </Paragraph>
           
            
            <b>4. Real Annotation - Once completing steps 1-3, you’re ready to start annotating!</b>
            <br></br>
            <br></br>
            <Paragraph>
            Please do the two following topics, download the annotation file at the end of each annotation and send it by email to Arie Cattan at <a href="mailto:ariec@allenai.org" target="_blank">ariec@allenai.org</a>. We will
            analyze your annotation and come back to you soon!.
            <br></br>
            <br></br>
            <ul>
            <li><a href="https://nlp.biu.ac.il/~ariecattan/sci-coref-hypernym/annotation.html?id=malware" target="_blank">Malware Classification</a></li>
                <li><a href="https://nlp.biu.ac.il/~ariecattan/sci-coref-hypernym/annotation.html?id=contextualized" target="_blank">Contextualized Embeddings</a></li>
            </ul>
            
            </Paragraph>
            
            <Box>
            You can annotate both the linking and the hierarchy together or alternate between these two tasks. 
            <Text strong> We strongly recommend annotating both tasks simultaneously</Text> - if you wait until after seeing all candidates, 
            it may be difficult to recall what some of the clusters refer to. 
            As shown above, you can also add notes to cluster names after adding them - to help you remember their meaning. 
            This could be especially useful with cluster names that are very similar but have different meanings.
            </Box>
            <br></br>
            
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

const Box = styled.div`
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.palette.background.warning};
    border: 1px solid ${({ theme }) => theme.palette.border.warning};
    border-radius: 4px;
`;

const Wrong = styled.span`
    background: ${({ theme }) => theme.color.R4};
    border: 1px solid ${({ theme }) => theme.color.R4};
    border-radius: 4px;
`;

