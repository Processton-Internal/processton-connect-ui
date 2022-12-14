import React, { useEffect, useRef } from 'react';
import ActionRegistry, { ActionKind, CRUD } from "./ActionRegistry";
import FormEditor from "../components/FormEditor";
import { DataType } from "../services/DataTypeService";
import API from "../services/ApiService";
import { Config } from "../common/Symbols";
import { FormRootValue } from "../services/FormValue";
import PullImportIcon from "@material-ui/icons/SaveAlt";
import DataControl from "../components/DataControl";
import { switchMap } from "rxjs/operators";
import { of } from "rxjs";
import { useSpreadState } from "../common/hooks";
import LinearProgress from "@material-ui/core/LinearProgress";
import * as pluralize from "pluralize";
import { ExecutionMonitor } from "./ExecutionMonitor";
import { useContainerContext } from './ContainerContext';

const PullImport = ({ docked, dataType, onSubjectPicked, height }) => {

  const value = useRef(new FormRootValue({
    data_type: {
      id: dataType.id,
      _reference: true
    }
  }));

  const nameTouched = useRef(false);

  const [state, setState] = useSpreadState();
  const containerContext = useContainerContext();
  const [, setContainerState] = containerContext;

  const { formDataType } = state;

  useEffect(() => {
    setContainerState({ breadcrumbActionName: "Pull Import" });

    return () => {
      setContainerState({ breadcrumbActionName: null });
    };
  }, []);

  useEffect(() => {
    const subscription = dataType.getTitle().subscribe(
      formTitle => {
        const name = `Pull-import ${pluralize(formTitle)}`;
        const formDataType = DataType.from({
          name,
          schema: {
            type: 'object',
            properties: {
              task_description: {
                type: 'string'
              },
              data: {
                type: 'object'
              }
            }
          }
        });

        formDataType[Config] = {
          fields: {
            task_description: {
              controlProps: {
                onChange: () => nameTouched.current = true
              }
            },
            data: {
              control: DataControl,
              controlProps: {
                onChange: ({ file }) => {
                  if (!nameTouched.current) {
                    const taskName = value.current.propertyValue('task_description');
                    const fileName = file && Object.keys(file)[0];
                    if (fileName) {
                      taskName.set(
                        `${name} from ${fileName}`, true
                      );
                    } else {
                      taskName.set(name);
                    }
                  }
                }
              }
            }
          }
        };

        value.current.propertyValue('task_description').set(name);
        setState({ formTitle, formDataType });
      }
    );

    return () => subscription.unsubscribe();
  }, [dataType]);

  const handleCancel = () => {
    setContainerState({ actionKey: 'index' });
  }

  const handleFormSubmit = (_, value) => {
    const { data_type, data, task_description } = value.get();
    let formData;
    const headers = {};
    if (data.type === 'file') {
      let { file } = data;
      if (file) {
        file = Object.values(file)[0];
        formData = new FormData();
        formData.append('data', file);
        headers['Content-Type'] = 'multipart/form-data';
      }
    } else {
      formData = data.plain_data;
    }
    return of(headers).pipe(
      switchMap(headers => {
        let error;
        if (!formData) {
          error = { data: ['is required'] };
        }
        if (error) {
          throw ({ response: { data: error } });
        }

        return API.post('setup', 'data_type', data_type.id, 'digest', 'pull_import', {
          headers: {
            'X-Digest-Options': JSON.stringify({
              task_description: task_description.trim() || null
            }),
            ...headers
          }
        }, formData);
      })
    );
  };

  if (!formDataType) {
    return <LinearProgress className="full-width" />;
  }

  return (
    <div className="relative">
      <FormEditor docked={docked}
                  dataType={formDataType}
                  height={height}
                  submitIcon={<PullImportIcon component="svg" />}
                  onFormSubmit={handleFormSubmit}
                  onSubjectPicked={onSubjectPicked}
                  successControl={ExecutionMonitor}
                  cancelEditor={handleCancel}
                  value={value.current} />
    </div>
  );
};

export default ActionRegistry.register(PullImport, {
  kind: ActionKind.collection,
  icon: PullImportIcon,
  title: 'Pull Import',
  crud: [CRUD.create, CRUD.update],
  onlyFor: [
    {
      "namespace": "Setup",
      "name": "Namespace"
    },
    {
      "namespace": "Setup",
      "name": "Flow"
    },
    {
      "namespace": "Setup",
      "name": "ConnectionRole"
    },
    {
      "namespace": "Setup",
      "name": "Translator"
    },
    {
      "namespace": "Setup",
      "name": "Template"
    },
    {
      "namespace": "Setup",
      "name": "ErbTemplate"
    },
    {
      "namespace": "Setup",
      "name": "HandlebarsTemplate"
    },
    {
      "namespace": "Setup",
      "name": "LiquidTemplate"
    },
    {
      "namespace": "Setup",
      "name": "PrawnTemplate"
    },
    {
      "namespace": "Setup",
      "name": "RubyTemplate"
    },
    {
      "namespace": "Setup",
      "name": "XsltTemplate"
    },
    {
      "namespace": "Setup",
      "name": "ParserTransformation"
    },
    {
      "namespace": "Setup",
      "name": "RubyParser"
    },
    {
      "namespace": "Setup",
      "name": "UpdaterTransformation"
    },
    {
      "namespace": "Setup",
      "name": "RubyUpdater"
    },
    {
      "namespace": "Setup",
      "name": "ConverterTransformation"
    },
    {
      "namespace": "Setup",
      "name": "HandlebarsConverter"
    },
    {
      "namespace": "Setup",
      "name": "LiquidConverter"
    },
    {
      "namespace": "Setup",
      "name": "MappingConverter"
    },
    {
      "namespace": "Setup",
      "name": "RubyConverter"
    },
    {
      "namespace": "Setup",
      "name": "XsltConverter"
    },
    {
      "namespace": "Setup",
      "name": "LegacyTranslator"
    },
    {
      "namespace": "Setup",
      "name": "Converter"
    },
    {
      "namespace": "Setup",
      "name": "Parser"
    },
    {
      "namespace": "Setup",
      "name": "Renderer"
    },
    {
      "namespace": "Setup",
      "name": "Updater"
    },
    {
      "namespace": "Setup",
      "name": "Event"
    },
    {
      "namespace": "Setup",
      "name": "Scheduler"
    },
    {
      "namespace": "Setup",
      "name": "Observer"
    },
    {
      "namespace": "Setup",
      "name": "Application"
    },
    {
      "namespace": "Setup",
      "name": "DataType"
    },
    {
      "namespace": "Setup",
      "name": "JsonDataType"
    },
    {
      "namespace": "Setup",
      "name": "FileDataType"
    },
    {
      "namespace": "Setup",
      "name": "Schema"
    },
    {
      "namespace": "Setup",
      "name": "CustomValidator"
    },
    {
      "namespace": "Setup",
      "name": "XsltValidator"
    },
    {
      "namespace": "Setup",
      "name": "AlgorithmValidator"
    },
    {
      "namespace": "Setup",
      "name": "EdiValidator"
    },
    {
      "namespace": "Setup",
      "name": "Algorithm"
    },
    {
      "namespace": "Setup",
      "name": "Snippet"
    },
    {
      "namespace": "Setup",
      "name": "Resource"
    },
    {
      "namespace": "Setup",
      "name": "Operation"
    },
    {
      "namespace": "Setup",
      "name": "PlainWebhook"
    },
    {
      "namespace": "Setup",
      "name": "Connection"
    },
    {
      "namespace": "Setup",
      "name": "Authorization"
    },
    {
      "namespace": "Setup",
      "name": "BaseOauthAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "Oauth2Authorization"
    },
    {
      "namespace": "Setup",
      "name": "AppAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "LazadaAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "OauthAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "AwsAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "BasicAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "GenericCallbackAuthorization"
    },
    {
      "namespace": "Setup",
      "name": "AuthorizationProvider"
    },
    {
      "namespace": "Setup",
      "name": "BaseOauthProvider"
    },
    {
      "namespace": "Setup",
      "name": "Oauth2Provider"
    },
    {
      "namespace": "Setup",
      "name": "OauthProvider"
    },
    {
      "namespace": "Setup",
      "name": "GenericAuthorizationProvider"
    },
    {
      "namespace": "Setup",
      "name": "RemoteOauthClient"
    },
    {
      "namespace": "Setup",
      "name": "GenericAuthorizationClient"
    },
    {
      "namespace": "Setup",
      "name": "Oauth2Scope"
    },
    {
      "namespace": "Setup",
      "name": "Collection"
    }
  ],
  group: 2
});
