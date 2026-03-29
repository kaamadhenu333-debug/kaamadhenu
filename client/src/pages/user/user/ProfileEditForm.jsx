import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "../../../store/auth/useAuthStore";
import { useAddressStore } from "../../../store/user/useAddressStore";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const ProfileEditForm = () => {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  const {
    addresses,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "Madanapalle",
    state: "Andhra Pradesh",
    pincode: 517325,
    isDefault: false,
  });

  const [saving, setSaving] = useState(false);

  //////////////////////////////////////////////////////
  // Load user + addresses
  //////////////////////////////////////////////////////
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      fetchAddresses();

      // Optional: auto-fill email in address form
      setAddressForm((prev) => ({
        ...prev,
        email: user.email || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`,
        phone: user.phone || "",
      }));
    }
  }, [user, fetchAddresses]);

  //////////////////////////////////////////////////////
  // Profile Change
  //////////////////////////////////////////////////////
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //////////////////////////////////////////////////////
  // Address Change
  //////////////////////////////////////////////////////
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //////////////////////////////////////////////////////
  // Add / Update Address
  //////////////////////////////////////////////////////
  const handleAddOrUpdateAddress = async () => {
    if (editingAddressId) {
      await updateAddress(editingAddressId, addressForm);
    } else {
      await createAddress(addressForm);
    }

    resetAddressForm();
    fetchAddresses();
  };

  //////////////////////////////////////////////////////
  // Edit Address
  //////////////////////////////////////////////////////
  const handleEdit = (addr) => {
    setAddressForm(addr);
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
  };

  //////////////////////////////////////////////////////
  // Delete Address
  //////////////////////////////////////////////////////
  const handleDelete = async (id) => {
    await deleteAddress(id);
    fetchAddresses();
  };

  //////////////////////////////////////////////////////
  // Set Default
  //////////////////////////////////////////////////////
  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    fetchAddresses();
  };

  //////////////////////////////////////////////////////
  // Reset Address Form
  //////////////////////////////////////////////////////
  const resetAddressForm = () => {
    setAddressForm({
      fullName: "",
      phone: "",
      email: "",
      addressLine1: "",
      city: "Madanapalle",
      state: "Andhra Pradesh",
      pincode: 517325,
      isDefault: false,
    });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  //////////////////////////////////////////////////////
  // Submit Profile
  //////////////////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    await updateProfile(user._id, formData);

    setSaving(false);
    // alert("Profile Updated Successfully 🌿");
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700"
          >
            <ArrowLeft className="w-5 h-5" /> Continue Shopping
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>
        {/* ================= PROFILE SECTION ================= */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            <InputField
              label="Mobile Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ================= ADDRESS SECTION ================= */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Saved Addresses
            </h3>

            <button
              onClick={() => {
                resetAddressForm();
                setShowAddressForm(true);
              }}
              className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </button>
          </div>

          <div className="space-y-4">
            {addresses?.length === 0 && (
              <p className="text-gray-500 text-sm">No addresses saved yet.</p>
            )}

            {addresses?.map((addr) => (
              <div
                key={addr._id}
                className="border border-emerald-200 rounded-xl p-4 flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {addr.fullName}
                    {addr.isDefault && (
                      <span className="ml-3 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-gray-600">
                    {addr.addressLine1}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode}
                  </p>

                  <p className="text-sm text-gray-500">{addr.phone}</p>
                </div>

                <div className="flex space-x-3 items-center">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-emerald-600 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-xs text-gray-600 underline"
                    >
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="mt-6 border-t pt-6 space-y-4">
              <InputField
                label="Full Name"
                name="fullName"
                value={addressForm.fullName}
                onChange={handleAddressChange}
              />

              <InputField
                label="Phone"
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={addressForm.email}
                onChange={handleAddressChange}
              />
              <InputField
                label="Address Line"
                name="addressLine1"
                value={addressForm.addressLine1}
                onChange={handleAddressChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  name="city"
                  value={addressForm.city}
                  disabled
                  // onChange={handleAddressChange}
                />
                <InputField
                  label="State"
                  name="state"
                  value={addressForm.state}
                  disabled
                  // onChange={handleAddressChange}
                />
              </div>

              <InputField
                label="Pincode"
                name="pincode"
                value={addressForm.pincode}
                onChange={handleAddressChange}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressChange}
                />
                <label className="text-sm">Set as default address</label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddOrUpdateAddress}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                >
                  {editingAddressId ? "Update Address" : "Add Address"}
                </button>

                <button
                  onClick={resetAddressForm}
                  className="text-gray-600 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      required
    />
  </div>
);

export default ProfileEditForm;
