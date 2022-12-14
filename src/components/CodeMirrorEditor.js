import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import { from, of } from "rxjs";
import clsx from "clsx";

import 'codemirror/addon/mode/loadmode';
import 'codemirror/mode/meta';
import 'codemirror/lib/codemirror.css';

import zzip from "../util/zzip";
import Random from "../util/Random";
import { useSpreadState } from "../common/hooks";

const ExtraModeTypes = {
  Java: ['text/x-java-source']
};

Object.keys(ExtraModeTypes).forEach(
  mode => {
    const cmode = CodeMirror.modeInfo.find(({ name }) => name === mode);
    if (cmode) {
      const mimes = [
        ExtraModeTypes[mode],
        cmode.mime,
        cmode.mimes
      ].flat()
        .filter((v, i, a) => a.indexOf(v) === i)
        .filter(v => v);
      if (mimes.length > 1) {
        cmode.mimes = mimes;
      } else {
        cmode.mime = mimes;
      }
    }
  }
);

const autoHeightFor = json => !json || json.split(/\r\n|\r|\n/).length < 20;

export default function CodeMirrorEditor(
  {
    property, value, disabled, readOnly, errors, onChange, mime, mode,
    theme, lineNumbers, viewportMargin, gutters, lint, foldGutter, onBlur,
    autoHeight, addons, customCSS, classes, children, eraser, customHeight
  }
) {
  const textElRef = useRef(null);
  const [state, setState] = useSpreadState({
    autoHeight: value.get()
  });

  const { editor } = state;
  const setEditor = editor => setState({ editor });

  const customCssRef = useRef(`c${Random.string()}`);

  const cleared = useRef(false);

  useEffect(() => {
    if (editor && eraser) {
      const subscription = eraser.subscribe(() => {
        cleared.current = true;
        editor.setValue('');
      });
      return () => subscription.unsubscribe();
    }
  }, [editor, eraser]);

  useEffect(() => {
    if (textElRef.current) {
      const opts = {};

      if (gutters) {
        opts.gutters = gutters;
      }

      const editor = CodeMirror.fromTextArea(textElRef.current, opts);

      setEditor(editor);
    }
  }, []);

  const onBlurRef = useRef(null);

  useEffect(() => {
    if (editor) {
      if (onBlurRef.current) {
        editor.off('blur', onBlurRef.current);
      }

      if (onBlur) {
        editor.on('blur', onBlur);
      }

      onBlurRef.current = onBlur;
    }
  }, [editor, onBlur]);

  useEffect(() => {
    if (editor) {
      let cmMime = mime || property.propertySchema.contentMediaType || 'text/plain';
      const modeInfo = CodeMirror.findModeByMIME(cmMime);
      if (modeInfo) {
        cmMime = modeInfo.mime || cmMime;
      }
      const cmMode = (
        mode || (
          modeInfo || CodeMirror.findModeByMIME('text/plain')
        ).mode
      );

      const subscription = zzip(
        (theme && from(import(`codemirror/theme/${theme || 'default'}.css`))) || of(true),
        (cmMode === 'null' && of(true)) || from(import(`codemirror/mode/${cmMode}/${cmMode}`)),
        ...(addons || []).map(
          addon => from(import(`codemirror/addon/${addon[0]}/${addon[1]}`))
        )
      ).subscribe(
        () => {
          const opts = {
            mode: cmMime,
            lineNumbers,
            lint,
            foldGutter
          };
          if (theme) {
            opts.theme = theme;
          }
          if (viewportMargin) {
            opts.viewportMargin = viewportMargin;
          }
          Object.keys(opts).forEach(
            opt => editor.setOption(opt, opts[opt])
          );
          CodeMirror.autoLoadMode(editor, cmMode);
        }
      );

      return () => subscription.unsubscribe();
    }

  }, [editor, property, mime, mode, addons, gutters, viewportMargin]);

  useEffect(() => {
    if (editor) {
      const ro = Boolean(readOnly || disabled);
      editor.setOption('readOnly', ro);
      editor.setOption('cursorBlinkRate', ro ? -1 : 530);
    }
  }, [readOnly, disabled, editor]);

  useEffect(() => {
    if (editor) {
      const handleChange = () => {
        if (cleared.current) {
          cleared.current = false;
          editor.save();
        } else {
          value.set(editor.getValue(), true);
          setState({ autoHeight: autoHeightFor(editor.getValue()) });
          onChange && onChange(editor.getValue());
        }
        setState({}); // to refresh
      };

      editor.on('change', handleChange);
      editor.on('paste', handleChange);
    }

    const subscription = value.changed().subscribe(
      v => {
        if (editor) {
          const strValue = v || '';
          if (strValue !== editor.getValue()) {
            editor.setValue(strValue);
            setState({ autoHeight: autoHeightFor(strValue) });
          }
        }
      }
    );
    value.changed().next(value.get());
    return () => subscription.unsubscribe();
  }, [editor, value]);

  let styles = '';
  if (customHeight) {
    styles = `height: ${customHeight};`;
  } else if (autoHeight || (autoHeight === undefined && state.autoHeight)) {
    styles = 'height: auto;'
  }

  const error = Boolean(errors && errors.length);

  const customStyles = ((editor && customCSS) || []).map(
    cls => `.${customCssRef.current} ${cls}`
  ).join(' ');

  return (
    <React.Fragment>
      <style>
        {`.${classes.editor}.${customCssRef.current} .CodeMirror { ${styles} }`}
        {customStyles}
      </style>
      <div className={clsx(classes.editor, customCssRef.current, error && classes.error)}>
        {children}
        <textarea ref={textElRef}
                  hidden={true} />
      </div>
    </React.Fragment>
  );
}
