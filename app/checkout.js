import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tokens from "../src/theme/tokens";
import useCartStore from "../src/stores/cartStore";
import useCheckoutStore from "../src/stores/checkoutStore";
import TopBar from "../src/components/TopBar";
import PrimaryButton from "../src/components/PrimaryButton";

const fmt = (n) =>
  "$" +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function VisaBadge() {
  return (
    <View style={styles.visaBadge}>
      <Text style={styles.visaText}>VISA</Text>
    </View>
  );
}

function SectionCard({ children }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

function CardHeader({ title, rightActions }) {
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardHeaderActions}>{rightActions}</View>
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const tax = useCartStore((s) => s.tax);
  const total = useCartStore((s) => s.total);

  const address = useCheckoutStore((s) => s.address);
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const placing = useCheckoutStore((s) => s.placing);
  const order = useCheckoutStore((s) => s.order);
  const placeOrder = useCheckoutStore((s) => s.placeOrder);
  const fetchCheckoutData = useCheckoutStore((s) => s.fetchCheckoutData);
  const checkoutLoadStatus = useCheckoutStore((s) => s.checkoutLoadStatus);
  const checkoutError = useCheckoutStore((s) => s.checkoutError);
  const addresses = useCheckoutStore((s) => s.addresses);
  const selectAddress = useCheckoutStore((s) => s.selectAddress);
  const paymentMethods = useCheckoutStore((s) => s.paymentMethods);
  const selectPaymentMethod = useCheckoutStore((s) => s.selectPaymentMethod);
  const [pendingAddressId, setPendingAddressId] = useState(null);
  const [pendingPaymentMethodId, setPendingPaymentMethodId] = useState(null);
  const addressSheetRef = useRef(null);
  const paymentSheetRef = useRef(null);
  const addressSnapPoints = useMemo(() => ["45%", "65%"], []);
  const paymentSnapPoints = useMemo(() => ["45%", "65%"], []);

  const paymentLabel = useMemo(() => {
    const last4 = paymentMethod?.last4 ?? "••••";
    const brand = (paymentMethod?.brand || "Card").toString();
    const label = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    return `${label} ending in ${last4}`;
  }, [paymentMethod]);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  useFocusEffect(
    useCallback(() => {
      fetchCheckoutData();
    }, [fetchCheckoutData]),
  );

  useEffect(() => {
    if (order) {
      router.replace(`/order-confirmation?id=${order.id}`);
    }
  }, [order]);

  useEffect(() => {
    setPendingAddressId(address?.id ?? null);
  }, [address?.id]);

  useEffect(() => {
    setPendingPaymentMethodId(paymentMethod?.id ?? null);
  }, [paymentMethod?.id]);

  const openAddressSheet = useCallback(() => {
    setPendingAddressId(address?.id ?? null);
    addressSheetRef.current?.expand();
  }, [address?.id]);

  const closeAddressSheet = useCallback(() => {
    setPendingAddressId(address?.id ?? null);
    addressSheetRef.current?.close();
  }, [address?.id]);

  const onAddressSheetChange = useCallback(
    (index) => {
      if (index === -1) {
        setPendingAddressId(address?.id ?? null);
      }
    },
    [address?.id],
  );

  const openPaymentSheet = useCallback(() => {
    setPendingPaymentMethodId(paymentMethod?.id ?? null);
    paymentSheetRef.current?.expand();
  }, [paymentMethod?.id]);

  const closePaymentSheet = useCallback(() => {
    setPendingPaymentMethodId(paymentMethod?.id ?? null);
    paymentSheetRef.current?.close();
  }, [paymentMethod?.id]);

  const onPaymentSheetChange = useCallback(
    (index) => {
      if (index === -1) {
        setPendingPaymentMethodId(paymentMethod?.id ?? null);
      }
    },
    [paymentMethod?.id],
  );

  const renderSheetBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={
          <Feather name="arrow-left" size={22} color={tokens.colors.text} />
        }
        onLeftPress={() => router.back()}
        title="Checkout"
      />

      {checkoutLoadStatus === "loading" ? (
        <View style={styles.centerLoadingWrap}>
          <ActivityIndicator size="small" color={tokens.colors.primary} />
          <Text style={styles.centerLoadingText}>Loading checkout...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {checkoutError ? (
            <Text style={styles.errorText}>{checkoutError}</Text>
          ) : null}

          {/* Ship to */}
          <SectionCard>
            <CardHeader
              title="Ship to"
              rightActions={
                <>
                  <Pressable
                    onPress={() => {
                      if (address?.id) {
                        router.push(`/checkout-address-edit?id=${address.id}`);
                        return;
                      }
                      router.push("/addresses");
                    }}
                    hitSlop={8}
                  >
                    <Text style={styles.cardLink}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={openAddressSheet} hitSlop={8}>
                    <Text style={styles.cardLink}>Change</Text>
                  </Pressable>
                </>
              }
            />
            {address ? (
              <>
                <Text style={styles.addressName}>{address.name}</Text>
                <Text style={styles.addressLine}>{address.line1}</Text>
                {address.line2 ? (
                  <Text style={styles.addressLine}>{address.line2}</Text>
                ) : null}
                <Text style={styles.addressLine}>
                  {address.city}, {address.state} {address.zip}
                </Text>
                {address.country ? (
                  <Text style={styles.addressLine}>{address.country}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.addressLine}>
                Add a shipping address to continue.
              </Text>
            )}
          </SectionCard>

          {/* Payment */}
          <SectionCard>
            <CardHeader
              title="Payment"
              rightActions={
                <Pressable onPress={openPaymentSheet} hitSlop={8}>
                  <Text style={styles.cardLink}>Change</Text>
                </Pressable>
              }
            />
            <View style={styles.paymentRow}>
              <VisaBadge />
              <Text style={styles.paymentLabel}>
                {paymentMethod
                  ? paymentLabel
                  : "Add a payment method to continue."}
              </Text>
            </View>
          </SectionCard>

          {/* Order summary */}
          <SectionCard>
            <Text
              style={[styles.cardTitle, { marginBottom: tokens.spacing.md }]}
            >
              Order summary
            </Text>

            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSub} numberOfLines={1}>
                    {item.fitment ?? item.supplier}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  {fmt((item.price ?? 0) * (item.qty ?? 1))}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated tax</Text>
              <Text style={styles.summaryValue}>{fmt(tax)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </SectionCard>

          {/* Apple Pay button */}
          <TouchableOpacity
            style={[styles.applePayBtn, placing && styles.btnDisabled]}
            activeOpacity={0.85}
            disabled={
              placing ||
              checkoutLoadStatus !== "success" ||
              !address?.id ||
              !paymentMethod?.id
            }
            // onPress={() => placeOrder()}
          >
            {placing ? (
              <ActivityIndicator size="small" color={tokens.colors.white} />
            ) : (
              <View style={styles.applePayInner}>
                <Text style={styles.applePayText}>Pay with </Text>
                <FontAwesome
                  name="apple"
                  size={17}
                  color={tokens.colors.white}
                />
                <Text style={styles.applePayText}> Pay</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Pay with card */}
          <TouchableOpacity
            style={[styles.cardBtn, placing && styles.btnDisabled]}
            activeOpacity={0.8}
            disabled={
              placing ||
              checkoutLoadStatus !== "success" ||
              !address?.id ||
              !paymentMethod?.id
            }
            onPress={() => placeOrder()}
          >
            {placing ? (
              <ActivityIndicator size="small" color={tokens.colors.primary} />
            ) : (
              <Text style={styles.cardBtnLabel}>Pay with card</Text>
            )}
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legal}>
            By completing this purchase you agree to CarLens Terms of Service
            and Privacy Policy. All sales are final. Shipping times are
            estimates and may vary. Tax calculated based on delivery address.
          </Text>
        </ScrollView>
      )}

      <BottomSheet
        ref={addressSheetRef}
        index={-1}
        snapPoints={addressSnapPoints}
        enablePanDownToClose
        onChange={onAddressSheetChange}
        backdropComponent={renderSheetBackdrop}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.bottomSheetContentContainer,
            { paddingBottom: tokens.spacing.xl + insets.bottom },
          ]}
        >
          <Text style={styles.modalTitle}>Select shipping address</Text>
          {addresses.length === 0 ? (
            <Text style={styles.addressLine}>No saved addresses yet.</Text>
          ) : (
            addresses.map((entry) => {
              const selected = entry.id === pendingAddressId;
              return (
                <Pressable
                  key={entry.id}
                  style={[
                    styles.addressOption,
                    selected && styles.addressOptionSelected,
                  ]}
                  onPress={() => {
                    setPendingAddressId(entry.id);
                  }}
                >
                  <View style={styles.addressOptionRow}>
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <View style={styles.addressOptionBody}>
                      <Text style={styles.addressName}>{entry.name}</Text>
                      <Text style={styles.addressLine}>{entry.line1}</Text>
                      {entry.line2 ? (
                        <Text style={styles.addressLine}>{entry.line2}</Text>
                      ) : null}
                      <Text style={styles.addressLine}>
                        {entry.city}, {entry.state} {entry.zip}
                      </Text>
                      {entry.country ? (
                        <Text style={styles.addressLine}>{entry.country}</Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
          <View style={styles.modalActions}>
            <PrimaryButton
              label="Confirm"
              variant="filled"
              disabled={
                !pendingAddressId ||
                !addresses.some((a) => a.id === pendingAddressId)
              }
              onPress={() => {
                if (
                  pendingAddressId &&
                  addresses.some((a) => a.id === pendingAddressId)
                ) {
                  selectAddress(pendingAddressId);
                }
                addressSheetRef.current?.close();
              }}
              style={[styles.modalButton, styles.modalButtonSpaced]}
            />
            <PrimaryButton
              label="Cancel"
              variant="outlined"
              onPress={closeAddressSheet}
              style={styles.modalButton}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        ref={paymentSheetRef}
        index={-1}
        snapPoints={paymentSnapPoints}
        enablePanDownToClose
        onChange={onPaymentSheetChange}
        backdropComponent={renderSheetBackdrop}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.bottomSheetContentContainer,
            { paddingBottom: tokens.spacing.xl + insets.bottom },
          ]}
        >
          <Text style={styles.modalTitle}>Select payment method</Text>
          {paymentMethods.length === 0 ? (
            <Text style={styles.addressLine}>No saved cards yet.</Text>
          ) : (
            paymentMethods.map((method) => {
              const selected = method.id === pendingPaymentMethodId;
              const brand = method.brand
                ? method.brand.charAt(0).toUpperCase() +
                  method.brand.slice(1).toLowerCase()
                : "Card";
              return (
                <Pressable
                  key={method.id}
                  style={[
                    styles.addressOption,
                    selected && styles.addressOptionSelected,
                  ]}
                  onPress={() => setPendingPaymentMethodId(method.id)}
                >
                  <View style={styles.addressOptionRow}>
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <View style={styles.addressOptionBody}>
                      <Text style={styles.addressName}>
                        {brand} ending in {method.last4 || "••••"}
                      </Text>
                      <Text style={styles.addressLine}>
                        Expires {String(method.expMonth || "").padStart(2, "0")}
                        /{String(method.expYear || "").slice(-2)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
          <View style={styles.modalActions}>
            <PrimaryButton
              label="Confirm"
              variant="filled"
              disabled={
                !pendingPaymentMethodId ||
                !paymentMethods.some((m) => m.id === pendingPaymentMethodId)
              }
              onPress={() => {
                if (
                  pendingPaymentMethodId &&
                  paymentMethods.some((m) => m.id === pendingPaymentMethodId)
                ) {
                  selectPaymentMethod(pendingPaymentMethodId);
                }
                paymentSheetRef.current?.close();
              }}
              style={[styles.modalButton, styles.modalButtonSpaced]}
            />
            <PrimaryButton
              label="Cancel"
              variant="outlined"
              onPress={closePaymentSheet}
              style={styles.modalButton}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xxxl,
  },
  centerLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.sm,
  },
  centerLoadingText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  errorText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
    marginBottom: tokens.spacing.md,
  },

  // Cards
  sectionCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.white,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing.sm,
  },
  cardHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
  },
  cardTitle: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  cardLink: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
  },

  // Address
  addressName: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  addressLine: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
    lineHeight: tokens.fontSize.sm * 1.6,
  },

  // Payment
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.xs,
  },
  visaBadge: {
    width: 38,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#1A1F71",
    alignItems: "center",
    justifyContent: "center",
  },
  visaText: {
    fontFamily: tokens.fonts.sansBold,
    fontSize: 9,
    color: tokens.colors.white,
    letterSpacing: 0.5,
  },
  paymentLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },

  // Order summary items
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  itemSub: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.border,
    marginVertical: tokens.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing.xs,
  },
  summaryLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
  },
  summaryValue: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  totalLabel: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    fontStyle: "italic",
    color: tokens.colors.text,
  },
  totalValue: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },

  // Buttons
  applePayBtn: {
    height: 52,
    backgroundColor: tokens.colors.black,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.md,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  applePayInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  applePayText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
    letterSpacing: 0.2,
  },
  cardBtn: {
    height: 52,
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
    borderRadius: tokens.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.lg,
  },
  cardBtnLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.primary,
  },

  // Legal
  legal: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    textAlign: "center",
    lineHeight: tokens.fontSize.xs * 1.7,
  },
  bottomSheetContentContainer: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  modalTitle: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.md,
  },
  addressOption: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  addressOptionSelected: {
    borderColor: tokens.colors.primary,
  },
  addressOptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing.sm,
  },
  addressOptionBody: {
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: tokens.colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: tokens.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.primary,
  },
  modalActions: {
    marginTop: tokens.spacing.md,
  },
  modalButton: {
    width: "100%",
  },
  modalButtonSpaced: {
    marginBottom: tokens.spacing.sm,
  },
});
