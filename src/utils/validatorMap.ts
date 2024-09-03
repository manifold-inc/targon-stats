let validatorMap: Record<number, string> = {};

export const setValidatorMap = (validators: string[]) => {
  console.log("setValidatorMap called with:", validators);
  validatorMap = Object.fromEntries(
    validators.map((validator, index) => [1 << index, validator]),
  );
  console.log("validatorMap after setting:", validatorMap);
};

export const bitsToNames = (bitValue: number): string[] => {
  console.log("bitsToNames called with:", bitValue);
  console.log("Current validatorMap:", validatorMap);

  const result = Object.keys(validatorMap)
    .map((bit) => Number(bit))
    .filter((bit) => {
      const isSet = (bitValue & bit) !== 0;
      console.log(`Bit ${bit}: ${isSet ? "set" : "not set"}`);
      return isSet;
    })
    .map((bit) => {
      const name = validatorMap[bit];
      console.log(`Bit ${bit} maps to name: ${name}`);
      return name;
    })
    .filter((name): name is string => {
      const isValid = name !== undefined;
      console.log(`Name ${name}: ${isValid ? "valid" : "invalid"}`);
      return isValid;
    });

  console.log("bitsToNames result:", result);
  return result;
};

export const namesToBits = (names: string[]): number => {
  return names
    .map((name) => {
      const bit = Object.entries(validatorMap).find(
        ([, validatorName]) => validatorName === name,
      )?.[0];
      return bit ? Number(bit) : 0;
    })
    .reduce((acc, bit) => acc | bit, 0);
};

export default validatorMap;
