#pragma once
#include <Arduino.h>

#define NUM_FEATURES 12

static const float SCALER_MEAN[NUM_FEATURES] = { 2607.433195f, 2615.016818f, 2489.162821f, 2690.892711f, 2597.009193f, 1519.424988f, -649.585813f, 12985.393969f, 4942.602149f, 624.683086f, -7.000326f, -7.933490f };
static const float SCALER_SCALE[NUM_FEATURES] = { 240.197097f, 150.629977f, 191.772369f, 125.960386f, 223.812549f, 2280.284581f, 5796.750353f, 3948.553531f, 5380.220100f, 1290.257791f, 2028.365692f, 1157.141586f };

inline void standardizeFeatures(float feat[NUM_FEATURES]) {
  for (int i = 0; i < NUM_FEATURES; ++i) {
    feat[i] = (feat[i] - SCALER_MEAN[i]) / SCALER_SCALE[i];
  }
}
