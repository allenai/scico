import React from 'react';
import {Content} from '@allenai/varnish/components';
import * as antd from 'antd';
import styled from 'styled-components';
const { Title, Paragraph, Text } = antd.Typography;

export default class AnnotationGuidelines extends React.PureComponent  {

    render() {
        return (
            <React.Fragment>
                <Content main className="center"  style={{width: "90%"}}>
                <h3>Annotation Guidelines</h3>


                <h4>Concept Linking</h4>

                <Paragraph>
                Following our downstream goal of faceted-search, (1) we are more interested in <Text strong>soft</Text> equivalence than in exact/strict matches, and (2) the surrounding context should help in some cases.
                </Paragraph>

                <Paragraph>
                    <Text strong underline>1. Diversity and soft equivalence:</Text>
                </Paragraph>
                <Paragraph>
                Papers might use different words to refer to the same underlying concept (method or task). These mentions should be linked. See below some examples:
                <ul>
                    <em>
                    <li>Class-conditional image synthesis = categorical image generation </li>
                    <li>Part-of-Speech = POS Tagging </li>
                    <li>Speech recognition = ASR</li>
                    <li>Aspect-based sentiment analysis = target-dependent sentiment classification</li>
                    <li>Hyper-parameter tuning = Hyper-parameter optimization</li>
                    <li>Scientific Knowledge Graph = Literature knowledge base</li>
                    <li>Word segmentation = tokenization </li>
                    </em>
                </ul>
                </Paragraph>

                <Paragraph>
                <p>
                    Indeed, if a user who restricts their results to concept A would also be satisfied 
                with papers mentioning concept B, and vice-versa, then A and B are 
                equivalent. As one common example, you’ll often see mentions that include generic words 
                such as “domain”, “process” -- these usually do not change the concept meaning. See below some examples:
                </p>
                <em>
                <ul>
                    <li>HMM based framework = HMMs = HMM tagger </li>
                    <li>Sequence tagging = sequence tagger = sequence tagging process</li>
                    <li>Relation extraction challenge = relation extraction domain</li>
                    <li>Convolutional Neural Network = Convolutional layer</li>
                    <li>BERT baseline = BERT model</li>
                    <li>Information Extraction = Information Extraction process</li>
                </ul>
                </em>
                </Paragraph>

                <Paragraph>
                    <Text strong>We highly recommend to keep in mind the faceted-search application for these soft equivalence decisions!</Text>
                </Paragraph>

                    <br></br>
                    

                <Paragraph>
                    <Text strong underline>2. Context</Text>
                </Paragraph>
                <Paragraph>
                In some cases, the mention is too generic and you need the context to link it to its corresponding 
                concepts.  For example, the mention <Text mark><em>recognizing and translating</em></Text> (Paper 5 in the faceted search example)
                 can be linked to the “speech recognition” task only given the subsequent words in the sentence “spoken language to 
                 text…”, but should be linked to another concept if the context was “biased pronoun from English to French”. 
                 In other cases, a term may be ambiguous, or you just may not recognize it, and you will want to read the context to figure it out.
                 See below more examples.
                </Paragraph>

                <Paragraph>
                    <ul>
                        <em>
                        <li><Text mark>Speech</Text> and handwriting recognition = ASR</li>
                        <li><Text mark>Parsing</Text> a sentence into its AMR graph = AMR parsing </li>
                        <li><Text mark>EM</Text> score of 48.9 = Exact Match</li>
                        <li>We use the <Text mark>EM</Text> algorithm = Expectation Maximization</li>
                        <li><Text mark>Information Extraction</Text> can refer to the NLP task of extracting structured information from text, or to extracting information from video, or a more generic concept of gleaning information from data.</li>
                        </em>
                    </ul>
                
                </Paragraph>

                <Paragraph>
                Use the context mostly to resolve ambiguity -- when you’re not sure about the meaning of mention. If you’re sure about the concept by just seeing the mention - there is no need to read further!
                </Paragraph>
                
                <Paragraph>
                <Box>
                However, if the context is not enough to determine the exact concept, we provide the link, the venue and the publication year of the 
                corresponding paper -- we <Text strong>highly</Text> recommend to take a quick look at the full paper in order to figure out the concept if needed.
                </Box>
                </Paragraph>
                

                <Paragraph>
                In rare cases, the span boundary of the candidate mention may be incorrect (e.g., <em>ontology<Text mark>-based information extraction</Text></em>, <em><Text mark>Schrödinger equa</Text> tion</em>, <Text mark>General Terms Anaphora Resolution</Text>). If such examples 
                occur, please consider the correct mention span (ontology-based information extraction, Schrödinger equation, Anaphora Resolution), and not only the proposed mention.
                </Paragraph>

                <h4>Hierarchy of Concepts</h4>
                <Paragraph>
                Similarly to the broad hypernym tasks (e.g., fruit is an hypernym of apple), scientific concepts can be regarded as types of 
                other concepts, see examples below:
                <ul>
                    <em>
                    <li>Abstract summarization is a subtype of text summarization</li>
                    <li>Aspect-based sentiment analysis is a subtype of sentiment analysis</li>
                    <li>LSTM and GRU are subtypes of RNN (Recurrent Neural Network)</li>
                    <li>Dependency parsing is a subtype of parsing</li>
                    <li>POS tagging is a subtype of sequence tagging</li>
                    <li>Multilingual Machine Translation is a subtype of Machine Translation</li>
                    <li>Word2vec is a type of word embeddings</li>
                    <li>Mask-Language Model is a type of Language Model</li>
                    </em>
                </ul>
                </Paragraph>

                <h4>Negative Examples</h4>
                <Paragraph>
                Some mentions may look similar but they actually refer to different concepts, like those respecting a 
                hierarchical relationship, or because of the context. See below some negative examples:
                <ul>
                    <em>
                        <li>Speech synthesis is not speech recognition</li>
                        <li>Dependency parsing is not constituency parsing</li>
                        <li>PTB POS Tagging should be under POS Tagging but not equivalent to POS Tagging because it’s a subtask of POS Tagging on specific tags.</li>
                        <li>Context-based word embeddings is not contextualized word embeddings</li>
                    </em>
                </ul>
                </Paragraph>
                </Content>
                
            </React.Fragment>
        );
    }
}


const Box = styled.div`
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.palette.background.info};
    border: 1px solid ${({ theme }) => theme.palette.border.info};
    border-radius: 4px;
`;