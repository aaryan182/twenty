import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/form-types/components/VariableChipStandalone';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputHint } from '@/ui/input/components/InputHint';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type FormNumberFieldInputProps = {
  label?: string;
  error?: string;
  placeholder: string;
  defaultValue: number | string | undefined;
  onPersist: (value: number | null | string) => void;
  onBlur?: () => void;
  VariablePicker?: VariablePickerComponent;
  hint?: string;
  readonly?: boolean;
};

export const FormNumberFieldInput = ({
  label,
  error,
  placeholder,
  defaultValue,
  onPersist,
  onBlur,
  VariablePicker,
  hint,
  readonly,
}: FormNumberFieldInputProps) => {
  const inputId = useId();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: string;
      }
    | {
        type: 'variable';
        value: string;
      }
  >(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: isDefined(defaultValue) ? String(defaultValue) : '',
        },
  );

  const persistNumber = (newValue: string) => {
    if (!canBeCastAsNumberOrNull(newValue)) {
      return;
    }

    const castedValue = castAsNumberOrNull(newValue);

    onPersist(castedValue);
  };

  const handleChange = (newText: string) => {
    setDraftValue({
      type: 'static',
      value: newText,
    });

    persistNumber(newText.trim());
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: '',
    });

    onPersist(null);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onPersist(variableName);
  };

  return (
    <FormFieldInputContainer>
      {label ? <StyledLabel htmlFor={inputId}>{label}</StyledLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInputContainer
          hasRightElement={isDefined(VariablePicker) && !readonly}
          onBlur={onBlur}
        >
          {draftValue.type === 'static' ? (
            <StyledInput
              inputId={inputId}
              placeholder={placeholder}
              value={draftValue.value}
              copyButton={false}
              hotkeyScope="record-create"
              onChange={handleChange}
              disabled={readonly}
            />
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInputContainer>

        {VariablePicker && !readonly ? (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>

      {hint ? <InputHint>{hint}</InputHint> : null}
      <InputErrorHelper>{error}</InputErrorHelper>
    </FormFieldInputContainer>
  );
};
