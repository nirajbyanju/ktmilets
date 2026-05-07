"use client";

import { useState } from "react";
import {
  FiPhone,
  FiMail,
  FiMessageSquare,
  FiCheck,
  FiUser,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { CreateFieldVist } from "@/apis/home/home.api";

export default function ScheduleTour({ property_id }: { property_id: number }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    name: "",
    phone: "",
    email: "",
    message: "",
    accept_term: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const validate = () => {
    if (!formData.accept_term) return "Please accept terms";
    if (!formData.phone.match(/^[0-9]{7,15}$/))
      return "Invalid phone number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const payload = new FormData();

      Object.entries({
        property_id: String(property_id),
        ...formData,
        accept_term: String(formData.accept_term),
      }).forEach(([key, value]) => payload.append(key, value));

      await CreateFieldVist(payload);

      setSuccess(true);

      setFormData({
        date: "",
        time: "",
        name: "",
        phone: "",
        email: "",
        message: "",
        accept_term: false,
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-opsh-background-light p-6 rounded-2xl shadow-opsh-lg space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-opsh-primary">
          Schedule a Tour
        </h2>
        <p className="text-sm text-opsh-muted">
          Pick your preferred date and time to visit this property.
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="p-3 rounded-lg bg-opsh-success/10 text-opsh-success text-sm">
          ✅ Tour request submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            icon={<FiCalendar />}
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            label="Date"
          />

          <Input
            icon={<FiClock />}
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            label="Time"
          />
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-opsh-primary">
            Your Information
          </h3>

          <Input
            icon={<FiUser />}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ram Kc"
            label="Name"
          />

          <Input
            icon={<FiPhone />}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="98XXXXXXXX"
            label="Phone"
          />

          <Input
            icon={<FiMail />}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ramkc@example.com"
            label="Email"
          />

          {/* Message */}
          <div>
            <label className="text-sm text-gray-600">Message</label>
            <div className="relative">
              <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opsh-primary outline-none"
                placeholder="Any special request..."
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="accept_term"
            checked={formData.accept_term}
            onChange={handleChange}
            className="mt-1"
          />
          <p className="text-opsh-muted">
            I accept the{" "}
            <span className="text-opsh-primary underline cursor-pointer">
              Terms
            </span>{" "}
            &{" "}
            <span className="text-opsh-primary underline cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-gradient-primary text-white py-3 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

/* Reusable Input */
function Input({
  icon,
  label,
  ...props
}: any) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          {...props}
          required
          className="pl-10 w-full px-4 py-3 border border-opsh-grey-border rounded-lg focus:ring-2 focus:ring-opsh-primary outline-none transition"
        />
      </div>
    </div>
  );
}