import React, { useEffect } from 'react';
import Skeleton from "@material-ui/lab/Skeleton";
import Chip from "@material-ui/core/Chip";
import { RecordSubject, TabsSubject } from "../services/subjects";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import zzip from "../util/zzip";
import { useSpreadState } from "../common/hooks";
import { DataType } from "../services/DataTypeService";

export default function (dataTypeProjection) {
  return function ({ item, prop, value, className }) {

    const [state, setState] = useSpreadState();

    const { title, dataType, empty } = state;

    useEffect(() => {
      const dataTypeId = dataTypeProjection(item)?.id;
      if (dataTypeId) {
        const subscription = DataType.getById(dataTypeId).pipe(
          switchMap(dataType => zzip(
            of(dataType),
            (value && dataType.titleFor(value)) || of(null)
          ))
        ).subscribe(
          ([dataType, title]) => setState({ dataType, title, empty: false })
        );

        return () => subscription.unsubscribe();
      } else {
        setState({ empty: true, dataType: null, title: null });
      }
    }, [item]);

    const handleClick = () => TabsSubject.next({
      key: RecordSubject.for(dataType.id, value.id).key
    });

    if (empty || dataType) {
      if (title) {
        return <Chip label={title} onClick={handleClick} className={className} />;
      }

      return <span>-</span>;
    }

    return <Skeleton variant="text" />;
  }
}
