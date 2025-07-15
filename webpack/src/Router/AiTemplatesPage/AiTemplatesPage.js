import React, { useState }  from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { TextContent, Text, TextVariants } from '@patternfly/react-core';

import {
  Button,
  ButtonType,
  Form,
  FormGroup,
  FormContextProvider,
  TextInput,
  FormSelect,
  Grid,
  GridItem,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
} from '@patternfly/react-core';

import {
  selectAPIStatus,
  selectAPIResponse,
} from 'foremanReact/redux/API/APISelectors';
import PageLayout from 'foremanReact/routes/common/PageLayout/PageLayout';
import { foremanUrl } from 'foremanReact/common/helpers';
import LabelIcon from 'foremanReact/components/common/LabelIcon';
import { post } from 'foremanReact/redux/API';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { STATUS } from 'foremanReact/constants';
import Loading from 'foremanReact/components/Loading';
import PermissionDenied from 'foremanReact/components/PermissionDenied';
import { translate as __ } from 'foremanReact/common/I18n';

import './AiTemplatesPage.scss';

const AiTemplatesPage = () => {
  const dispatch = useDispatch();

  const [copied, setCopied] = useState(false);
  const selector = state => selectAPIResponse(state, 'TODO_KEY').output;
  const aiTemplate = useSelector(selector);

  const handleSubmit = (e, values) => {
    e.preventDefault();

    const params = {
      uri_base: values['uri_base'],
    };
    dispatch(
      post({
        key: 'TODO_KEY',
        url: foremanUrl('/api/v2/ai_templates'),
        params,
      })
    );
    console.log('params', params);
  };

  const copyToClipboard = (e, text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onCopyClick = (e, text) => {
    copyToClipboard(e, text);
    setCopied(true);
  };
  const actions = (
    <CodeBlockAction>
      <ClipboardCopyButton
        id="basic-copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={e => onCopyClick(e, aiTemplate)}
        exitDelay={copied ? 1500 : 600}
        maxWidth="110px"
        variant="plain"
        onTooltipHidden={() => setCopied(false)}
      >
        {copied
          ? __('Successfully copied to clipboard!')
          : __('Copy to clipboard')}
      </ClipboardCopyButton>
    </CodeBlockAction>
  );

  return (
    <PageLayout header={__('AI templates')} searchable={false}>
      <>
        <TextContent>
          <Text ouiaId="ai-templates-page-top-msg" component={TextVariants.p}>
            {__(
              "Foreman can integrate different Large Language Models compatible with OpenAI's API." +
                ' Please fill out the form below to create a new AI template. '
            )}
          </Text>
        </TextContent>
        <br />
        <br />
        <Grid hasGutter>
          <GridItem>
            <FormContextProvider initialValues={{ 'select-id': 'Option 1' }}>
              {({ setValue, getValue, setError, values, errors }) => (
                <Form isHorizontal>
                  <FormGroup
                    label={__('URI Base')}
                    fieldId="uri_base"
                    labelIcon={
                      <LabelIcon
                        text={__(
                          'You can use local models, e.g. http://localhost:11434'
                        )}
                      />
                    }
                  >
                    <TextInput
                      ouiaId="uri_base"
                      id="uri_base"
                      value={getValue('uri_base')}
                      type="text"
                      onChange={(e, v) => setValue('uri_base', v)}
                    />
                  </FormGroup>
                  <Button
                    type={ButtonType.submit}
                    onClick={(e) => {
                      e.preventDefault();

                      handleSubmit(e, values);
                    }}
                  >
                    {__('Submit')}
                  </Button>
                </Form>
              )}
            </FormContextProvider>
          </GridItem>
          <GridItem>
            <CodeBlock actions={actions}>
              <CodeBlockCode id="code-content" className="ai-template-code">
                {aiTemplate}
              </CodeBlockCode>
            </CodeBlock>
          </GridItem>
        </Grid>
      </>
    </PageLayout>
  )
};

export default AiTemplatesPage;
